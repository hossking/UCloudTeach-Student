export class Tool {
  /**
   * 空校验 null或""都返回true
   */
  public static isEmpty(obj: any) {
    if ((typeof obj === 'string')) {
      return !obj || obj.replace(/\s+/g, "") === ""
    } else {
      return (!obj || JSON.stringify(obj) === "{}" || obj.length === 0);
    }
  }

  /**
   * 非空校验
   */
  public static isNotEmpty(obj: any) {
    return !this.isEmpty(obj);
  }

  /**
   * 对象复制
   */
  public static copy(obj: Record<any, any>) {
    if (Tool.isNotEmpty(obj)) {
      return JSON.parse(JSON.stringify(obj));
    }
  }
}
