declare module "sockjs-client" {
  class SockJS {
    constructor(url: string, options?: Record<string, unknown>);
  }
  export default SockJS;
}
