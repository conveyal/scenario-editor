// flow-typed signature: ab2bb889b6383e3621d4be20247fa013
// flow-typed version: da30fe6876/react-modal_v1.x.x/flow_>=v0.26.x <=v0.52.x

declare module "react-modal" {
  declare type DefaultProps = {
    isOpen: boolean,
    ariaHideApp: boolean,
    closeTimeoutMS: number,
    shouldCloseOnOverlayClick: boolean
  };
  declare type Props = {
    isOpen: boolean,
    style?: {
      content?: Object,
      overlay?: Object
    },
    appElement?: HTMLElement,
    ariaHideApp: boolean,
    closeTimeoutMS: number,
    onAfterOpen?: () => mixed,
    onRequestClose?: (event: Event) => mixed,
    shouldCloseOnOverlayClick: boolean
  };
  declare class Modal extends React$Component {
    static setAppElement(element: HTMLElement | string): void;
    static defaultProps: DefaultProps;
    props: Props;
  }
  declare module.exports: typeof Modal;
}
