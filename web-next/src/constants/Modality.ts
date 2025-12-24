export interface ModalityOption {
    value: string;
    text: string;
    color: string;
}

export const MODALITY_OPTIONS: Record<string, ModalityOption> = {
  audio: {
    value: 'audio',
    text: 'Audio',
    color: 'orange'
  },
  image: {
    value: 'image',
    text: 'Image',
    color: 'blue'
  },
  music: {
    value: 'music',
    text: 'Music',
    color: 'red'
  },
  text: {
    value: 'text',
    text: 'Text',
    color: 'green'
  },
  video: {
    value: 'video',
    text: 'Video',
    color: 'cyan'
  }
};
