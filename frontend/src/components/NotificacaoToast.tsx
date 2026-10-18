import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type TipoNotificacao = 'sucesso' | 'erro' | 'aviso' | 'info';

export interface NotificacaoItem {
  id: string;
  tipo: TipoNotificacao;
  titulo?: string;
  mensagem: string;
  duracaoMs?: number;
}

interface NotificacaoContextData {
  notificar: (item: Omit<NotificacaoItem, 'id'>) => void;
  sucesso: (mensagem: string, titulo?: string) => void;
  erro: (mensagem: string, titulo?: string) => void;
  aviso: (mensagem: string, titulo?: string) => void;
  info: (mensagem: string, titulo?: string) => void;
}

const NotificacaoContext = createContext<NotificacaoContextData>({} as NotificacaoContextData);

export function NotificacaoProvider({ children }: { children: React.ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);

  const removerNotificacao = useCallback((id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  }, []);

  const notificar = useCallback(
    ({ tipo, titulo, mensagem, duracaoMs = 4000 }: Omit<NotificacaoItem, 'id'>) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const nova: NotificacaoItem = { id, tipo, titulo, mensagem, duracaoMs };

      setNotificacoes(prev => [nova, ...prev.slice(0, 4)]); // maximo 5 na tela

      if (duracaoMs > 0) {
        setTimeout(() => {
          removerNotificacao(id);
        }, duracaoMs);
      }
    },
    [removerNotificacao]
  );

  const sucesso = useCallback(
    (mensagem: string, titulo?: string) => notificar({ tipo: 'sucesso', mensagem, titulo }),
    [notificar]
  );
  const erro = useCallback(
    (mensagem: string, titulo?: string) => notificar({ tipo: 'erro', mensagem, titulo }),
    [notificar]
  );
  const aviso = useCallback(
    (mensagem: string, titulo?: string) => notificar({ tipo: 'aviso', mensagem, titulo }),
    [notificar]
  );
  const info = useCallback(
    (mensagem: string, titulo?: string) => notificar({ tipo: 'info', mensagem, titulo }),
    [notificar]
  );

  return (
    <NotificacaoContext.Provider value={{ notificar, sucesso, erro, aviso, info }}>
      {children}

      {/* Container de Toasts Flutuantes */}
      <div className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col space-y-3 pointer-events-none max-w-sm w-full">
        {notificacoes.map(n => {
          let bgClass = 'bg-white border-dark text-dark';
          let icone = <Info className="w-5 h-5 text-indigo-600 stroke-[2.5]" />;
          let accentBar = 'bg-indigo-600';

          if (n.tipo === 'sucesso') {
            bgClass = 'bg-white border-dark text-dark';
            icone = <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />;
            accentBar = 'bg-emerald-500';
          } else if (n.tipo === 'erro') {
            bgClass = 'bg-rose-50 border-dark text-dark';
            icone = <AlertCircle className="w-5 h-5 text-rose-600 stroke-[2.5]" />;
            accentBar = 'bg-rose-500';
          } else if (n.tipo === 'aviso') {
            bgClass = 'bg-amber-50 border-dark text-dark';
            icone = <AlertTriangle className="w-5 h-5 text-amber-600 stroke-[2.5]" />;
            accentBar = 'bg-amber-500';
          }

          return (
            <div
              key={n.id}
              className={`pointer-events-auto border-3 rounded-2xl p-4 shadow-[4px_4px_0px_0px_#191A23] transition-all transform animate-slide-in-right relative overflow-hidden flex items-start gap-3 ${bgClass}`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentBar}`} />

              <div className="shrink-0 mt-0.5 ml-1">{icone}</div>

              <div className="flex-1 pr-2">
                {n.titulo && (
                  <h4 className="text-xs font-black uppercase tracking-wider font-display mb-0.5">
                    {n.titulo}
                  </h4>
                )}
                <p className="text-xs font-medium leading-relaxed">{n.mensagem}</p>
              </div>

              <button
                type="button"
                onClick={() => removerNotificacao(n.id)}
                className="shrink-0 p-1 text-dark/50 hover:text-dark hover:bg-dark/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificacaoContext.Provider>
  );
}

export function useNotificacao() {
  return useContext(NotificacaoContext);
}
