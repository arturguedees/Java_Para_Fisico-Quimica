import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * Componente de seguranca no cliente pra impedir que usuarios externos abram o "Inspecionar"
 * (clique direito do mouse) ou o DevTools pelos atalhos de teclado (F12, Ctrl+Shift+I, Cmd+Option+I, etc).
 * Tambem detecta se a janela do DevTools foi aberta medindo a diferenca entre outerWidth e innerWidth!
 */
export default function ProtecaoInspecao() {
  const [avisoVisivel, setAvisoVisivel] = useState(false);

  useEffect(() => {
    let timerAviso: ReturnType<typeof setTimeout> | null = null;

    const dispararAviso = () => {
      setAvisoVisivel(true);
      if (timerAviso) clearTimeout(timerAviso);
      timerAviso = setTimeout(() => {
        setAvisoVisivel(false);
      }, 2800);
    };

    // 1. Bloqueia o menu de contexto do botao direito ("Inspecionar" / "Inspect Element")
    const bloquearBotaoDireito = (e: MouseEvent) => {
      e.preventDefault();
      dispararAviso();
      return false;
    };

    // 2. Bloqueia os atalhos de teclado classicos do DevTools e de exibir codigo-fonte (Windows, Linux e Mac)
    const bloquearAtalhosDevTools = (e: KeyboardEvent) => {
      const tecla = e.key?.toUpperCase() || '';
      const codigo = e.keyCode || e.which;

      // F12 (codigo 123)
      const isF12 = tecla === 'F12' || codigo === 123;

      // Ctrl + Shift + I / J / C / K (Windows/Linux)
      const isCtrlShiftDev =
        e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(tecla);

      // Cmd + Option (Alt) + I / J / C / K / U ou Cmd + Shift + I / C (Mac OS)
      const isMacDev =
        (e.metaKey && e.altKey && ['I', 'J', 'C', 'K', 'U'].includes(tecla)) ||
        (e.metaKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(tecla));

      // Ctrl + U (Ver codigo-fonte da pagina)
      const isViewSource = (e.ctrlKey || e.metaKey) && tecla === 'U';

      if (isF12 || isCtrlShiftDev || isMacDev || isViewSource) {
        e.preventDefault();
        e.stopPropagation();
        dispararAviso();
        return false;
      }
    };

    // 3. Detecta se o usuario tentou abrir o DevTools pelo menu do navegador (diferenca de tamanho da janela)
    const detectarJanelaDevTools = () => {
      const limiar = 170;
      const larguraAberta = window.outerWidth - window.innerWidth > limiar;
      const alturaAberta = window.outerHeight - window.innerHeight > limiar;
      if (larguraAberta || alturaAberta) {
        // Limpa o console pra nao deixar curioso vendo logs internos
        try {
          console.clear();
        } catch {
          // ignora caso o navegador bloqueie
        }
      }
    };

    document.addEventListener('contextmenu', bloquearBotaoDireito, { capture: true });
    window.addEventListener('keydown', bloquearAtalhosDevTools, { capture: true });
    window.addEventListener('resize', detectarJanelaDevTools);

    return () => {
      document.removeEventListener('contextmenu', bloquearBotaoDireito, { capture: true });
      window.removeEventListener('keydown', bloquearAtalhosDevTools, { capture: true });
      window.removeEventListener('resize', detectarJanelaDevTools);
      if (timerAviso) clearTimeout(timerAviso);
    };
  }, []);

  if (!avisoVisivel) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] bg-dark text-white border-3 border-brand rounded-2xl px-4 py-3 shadow-neo flex items-center space-x-3 animate-slide-up pointer-events-none max-w-sm">
      <ShieldAlert className="w-5 h-5 text-brand shrink-0 stroke-[2.5]" />
      <div className="text-xs font-bold leading-snug">
        <span className="font-black text-brand uppercase block tracking-wider">
          Protected Environment / Ambiente Protegido
        </span>
        <span>
          Inspection and DevTools are disabled for external users.
        </span>
      </div>
    </div>
  );
}
