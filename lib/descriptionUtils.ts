import md5 from 'crypto-js/md5';
import { DescriptionOption, DescriptionMatchMode, DescriptionCombineMode } from '@/types/video';

/**
 * Normaliza uma descrição para comparação consistente
 */
export const normalizeDescription = (text: string | null | undefined): string => {
  if (!text) return '';

  return text
    .trim() // Remove espaços início/fim
    .toLowerCase() // Case-insensitive
    .replace(/\s+/g, ' ') // Colapsa múltiplos espaços
    .replace(/['']/g, "'") // Normaliza aspas
    .replace(/[""]/g, '"'); // Normaliza aspas duplas
};

/**
 * Gera um ID único para uma descrição
 */
export const generateDescriptionId = (text: string): string => {
  const normalized = normalizeDescription(text);
  return md5(normalized).toString().substring(0, 12);
};

/**
 * Extrai opções de descrição únicas de um array de vídeos
 */
export const extractDescriptionOptions = (
  videos: { description: string; date_posted: string }[]
): DescriptionOption[] => {
  const descriptionMap = new Map<string, DescriptionOption>();

  videos.forEach(video => {
    const text = video.description || '';
    if (!text.trim()) return; // Ignora descrições vazias

    const normalized = normalizeDescription(text);
    const id = generateDescriptionId(text);

    if (descriptionMap.has(id)) {
      const existing = descriptionMap.get(id)!;
      existing.count++;

      // Atualizar datas min/max
      if (video.date_posted < existing.firstPosted) {
        existing.firstPosted = video.date_posted;
      }
      if (video.date_posted > existing.lastPosted) {
        existing.lastPosted = video.date_posted;
      }
    } else {
      descriptionMap.set(id, {
        id,
        text,
        normalizedText: normalized,
        count: 1,
        firstPosted: video.date_posted,
        lastPosted: video.date_posted,
      });
    }
  });

  // Ordena por frequência (maior primeiro) e depois alfabeticamente
  return Array.from(descriptionMap.values()).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.normalizedText.localeCompare(b.normalizedText);
  });
};

/**
 * Filtra vídeos baseado nas descrições selecionadas
 */
export const filterVideosByDescriptions = <T extends { description: string }>(
  videos: T[],
  selectedIds: string[],
  options: DescriptionOption[],
  matchMode: DescriptionMatchMode,
  combineMode: DescriptionCombineMode
): T[] => {
  if (selectedIds.length === 0) return videos;

  // Mapeia IDs para textos normalizados
  const selectedTexts = options
    .filter(opt => selectedIds.includes(opt.id))
    .map(opt => opt.normalizedText);

  return videos.filter(video => {
    const videoDesc = normalizeDescription(video.description);

    if (matchMode === 'exact') {
      // Modo Exato: descrição normalizada deve ser igual
      if (combineMode === 'OR') {
        return selectedTexts.some(text => videoDesc === text);
      } else {
        // AND em exact: só funciona se todas forem idênticas (caso raro)
        return selectedTexts.every(text => videoDesc === text);
      }
    } else {
      // Modo Contains: descrição deve conter o termo
      if (combineMode === 'OR') {
        return selectedTexts.some(text => videoDesc.includes(text));
      } else {
        return selectedTexts.every(text => videoDesc.includes(text));
      }
    }
  });
};

/**
 * Trunca texto longo para exibição
 */
export const truncateText = (text: string, maxLength: number = 60): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
