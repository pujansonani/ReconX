import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  subscribeToLiveStreamFromFirestore,
  pushLiveEventToFirestore
} from '../services/firestoreService';

export interface LiveEvent {
  id: string;
  type: 'MATCH_SUCCESS' | 'BATCH_SOLVED' | 'EXCEPTION_FLAGGED' | 'CONNECTED';
  tier?: string;
  title: string;
  order_id?: string;
  gateway_id?: string;
  bank_ref?: string;
  gross_amount?: number;
  net_amount?: number;
  fee?: number;
  variance?: number;
  status: string;
  category?: string;
  message: string;
  time: string;
}

interface LiveMetrics {
  totalIngested: number;
  totalMatched: number;
  totalExceptions: number;
  totalVolume: number;
}

interface LiveReconContextType {
  isConnected: boolean;
  isStreaming: boolean;
  liveEvents: LiveEvent[];
  liveMetrics: LiveMetrics;
  firebaseSynced: boolean;
  toggleStreaming: () => void;
  injectEvent: (category: 'TIER_1_EXACT' | 'FEE_MISMATCH' | 'CHARGEBACK', amount?: number, order_id?: string) => Promise<void>;
  clearEvents: () => void;
}

const LiveReconContext = createContext<LiveReconContextType | undefined>(undefined);

export const LiveReconProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [firebaseSynced, setFirebaseSynced] = useState(true);
  const [isStreaming, setIsStreaming] = useState(true);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    totalIngested: 2000,
    totalMatched: 1948,
    totalExceptions: 52,
    totalVolume: 489700.00
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  // 1. Firebase Firestore Real-Time Listener
  useEffect(() => {
    const unsubscribeFirestore = subscribeToLiveStreamFromFirestore(
      (newEvent) => {
        setLiveEvents((prev) => {
          if (prev.some((e) => e.id === newEvent.id)) return prev;
          return [newEvent, ...prev.slice(0, 49)];
        });
        setFirebaseSynced(true);
      },
      (history) => {
        setLiveEvents((prev) => {
          const ids = new Set(prev.map((e) => e.id));
          const fresh = history.filter((h) => !ids.has(h.id));
          return [...fresh, ...prev].slice(0, 50);
        });
        setFirebaseSynced(true);
      }
    );

    return () => {
      unsubscribeFirestore();
    };
  }, []);

  // 2. FastAPI SSE Stream for low-latency push
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        const url = 'http://127.0.0.1:8000/api/stream/events';
        es = new EventSource(url);
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsConnected(true);
        };

        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === 'CONNECTED' && data.history) {
              setLiveEvents((prev) => {
                const combined = [...prev];
                data.history.forEach((item: LiveEvent) => {
                  if (!combined.some((c) => c.id === item.id)) {
                    combined.push(item);
                  }
                });
                return combined.slice(0, 50);
              });
            } else if (data.id) {
              setLiveEvents((prev) => {
                if (prev.some((p) => p.id === data.id)) return prev;
                return [data, ...prev.slice(0, 49)];
              });

              // Increment live metrics
              if (data.gross_amount) {
                setLiveMetrics((m) => {
                  const isExc = data.type === 'EXCEPTION_FLAGGED';
                  return {
                    totalIngested: m.totalIngested + 1,
                    totalMatched: isExc ? m.totalMatched : m.totalMatched + 1,
                    totalExceptions: isExc ? m.totalExceptions + 1 : m.totalExceptions,
                    totalVolume: m.totalVolume + (data.gross_amount || 0)
                  };
                });
              }
            }
          } catch (err) {
            console.error('Error parsing live SSE event:', err);
          }
        };

        es.onerror = () => {
          setIsConnected(false);
          es?.close();
          reconnectTimeout = setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        console.error('SSE connection error:', err);
        setIsConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (es) es.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const toggleStreaming = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/stream/toggle-sim', { method: 'POST' });
      setIsStreaming((prev) => !prev);
    } catch (e) {
      console.error('Error toggling stream:', e);
    }
  };

  const injectEvent = async (
    category: 'TIER_1_EXACT' | 'FEE_MISMATCH' | 'CHARGEBACK',
    amount: number = 14500.00,
    orderId: string = `ORD-LIVE-${Math.floor(Math.random() * 9000 + 1000)}`
  ) => {
    try {
      const livePayload: Partial<LiveEvent> = {
        id: `live_${Date.now()}`,
        type: category === 'TIER_1_EXACT' ? 'MATCH_SUCCESS' : 'EXCEPTION_FLAGGED',
        tier: category === 'TIER_1_EXACT' ? 'Tier 1 Exact Hash Match' : undefined,
        title: category === 'TIER_1_EXACT' ? `Tier 1 Exact Hash Match: ${orderId}` : `Real-time Dispute: ${orderId}`,
        order_id: orderId,
        gateway_id: `TXN-${orderId.replace('ORD-', '')}`,
        bank_ref: 'Inward Credit Batch Payout',
        gross_amount: amount,
        fee: amount * 0.018,
        net_amount: amount * (1 - 0.018 - 0.018 * 0.18),
        status: category === 'TIER_1_EXACT' ? 'RECONCILED' : 'FLAGGED_EXCEPTION',
        category: category,
        message: category === 'TIER_1_EXACT'
          ? `Real-time 3-way exact correlation matched ₹${amount.toFixed(2)}.`
          : `Dispute flagged in real time for ${orderId}.`,
        time: new Date().toLocaleTimeString()
      };

      // 1. Write directly to Cloud Firestore in real time
      await pushLiveEventToFirestore(livePayload);

      // 2. Also notify backend SSE engine
      await fetch('http://127.0.0.1:8000/api/stream/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount, order_id: orderId })
      }).catch(() => {});
    } catch (e) {
      console.error('Error injecting event:', e);
    }
  };

  const clearEvents = () => {
    setLiveEvents([]);
  };

  return (
    <LiveReconContext.Provider
      value={{
        isConnected,
        isStreaming,
        liveEvents,
        liveMetrics,
        firebaseSynced,
        toggleStreaming,
        injectEvent,
        clearEvents
      }}
    >
      {children}
    </LiveReconContext.Provider>
  );
};

export const useLiveRecon = () => {
  const context = useContext(LiveReconContext);
  if (!context) {
    throw new Error('useLiveRecon must be used within a LiveReconProvider');
  }
  return context;
};
