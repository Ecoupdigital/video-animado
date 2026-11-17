import { getStaticFiles } from 'remotion';

/** O arquivo existe na pasta public/ do vídeo? (no render e no Studio; fora deles, a lista vem vazia). */
export const temArquivo = (nome: string) => getStaticFiles().some((f) => f.name === nome);
