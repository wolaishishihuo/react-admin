import { useState } from 'react';

/** 剪贴板 Hook（navigator.clipboard）：copyToClipboard 返回是否成功，isCopied 供按钮态反馈 */
const useClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      return true;
    } catch (err) {
      console.error('复制操作不被支持或失败: ', err);
      setIsCopied(false);
      return false;
    }
  };

  return { copyToClipboard, isCopied };
};

export default useClipboard;
