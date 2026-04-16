import { useRef, useState } from 'react';

export function useRecorder() {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = (canvas) => {
    if (!canvas || !canvas.captureStream) {
      alert('Recording not supported in this browser. Use Chrome or Edge.');
      return;
    }
    chunksRef.current = [];
    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    recorderRef.current = new MediaRecorder(stream, { mimeType });
    recorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `flowbeat-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(a.href);
    };
    recorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  };

  return { startRecording, stopRecording, isRecording };
}
