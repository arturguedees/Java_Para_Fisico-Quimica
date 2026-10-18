import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '../i18n/i18n';

interface TextoExpansivelProps {
  texto: string;
  limiteCaracteres?: number;
  className?: string;
}

/**
 * Componente que adiciona "Ver mais / Ver menos" quando o texto da questão,
 * fórmula ou teoria for extenso, evitando poluição visual e quebra de layout.
 */
export default function TextoExpansivel({
  texto,
  limiteCaracteres = 140,
  className = '',
}: TextoExpansivelProps) {
  const [expandido, setExpandido] = useState(false);
  const { isEn } = useI18n();

  if (!texto || texto.length <= limiteCaracteres) {
    return <span className={className}>{texto}</span>;
  }

  const textoTruncado = texto.slice(0, limiteCaracteres) + '...';

  return (
    <span className={className}>
      {expandido ? texto : textoTruncado}{' '}
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          setExpandido(!expandido);
        }}
        className="inline-flex items-center gap-0.5 text-indigo-700 hover:text-indigo-900 font-black text-xs uppercase tracking-wider ml-1 underline underline-offset-2 hover:opacity-80 transition-all cursor-pointer"
      >
        <span>
          {expandido
            ? isEn
              ? 'Read less'
              : 'Ver menos'
            : isEn
            ? 'Read more'
            : 'Ver mais'}
        </span>
        {expandido ? (
          <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
        )}
      </button>
    </span>
  );
}
