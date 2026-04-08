interface DocumentPictureInPicture {
  readonly pictureInPictureEnabled: boolean;
  readonly pictureInPictureElement: Element | null;
  exitPictureInPicture: () => Promise<void>;
}

interface Document extends DocumentPictureInPicture {}

interface HTMLVideoElement {
  requestPictureInPicture: () => Promise<PictureInPictureWindow>;
}

interface PictureInPictureWindow extends EventTarget {
  readonly width: number;
  readonly height: number;
}
