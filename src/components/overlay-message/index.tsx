import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { FiCheckCircle } from 'react-icons/fi';

import './styles.css';

interface OverlayMessageProps {
  open: boolean;
  type?: string;
  redirect: string;
}

const OverlayMessage: React.FC<OverlayMessageProps> = (props) => {
  const history = useHistory();

  const [overlayMessageState, setOverlayMessageState] = useState<
    OverlayMessageProps
  >(props);

  useEffect(() => {
    setOverlayMessageState(props);
  }, [props]);

  const handleClick = () => {
    setOverlayMessageState({ open: false, redirect: props.redirect });
    history.push(overlayMessageState.redirect);
  };

  return (
    <div
      className="overlay"
      style={
        overlayMessageState.open
          ? { visibility: 'visible' }
          : { visibility: 'hidden' }
      }
    >
      <FiCheckCircle className="success-icon" />
      <h1>Ponto de coleta cadastrado com sucesso!</h1>
      <button onClick={handleClick}>Ok</button>
    </div>
  );
};

export default OverlayMessage;
