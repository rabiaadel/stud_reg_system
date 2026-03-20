import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import './index.css';
import App from './App';

const theme = {
  token: {
    colorPrimary: '#0b3c5d',
    colorInfo: '#0b3c5d',
    colorSuccess: '#1b9e77',
    colorWarning: '#c95f17',
    colorError: '#b42318',
    colorLink: '#0b3c5d',
    colorLinkHover: '#145374',
    colorBgLayout: '#f6f3ee',
    colorBgContainer: '#ffffff',
    colorTextBase: '#1f2937',
    borderRadius: 12,
    fontFamily: '"Source Sans 3", "Noto Kufi Arabic", sans-serif',
  },
  components: {
    Button: { fontWeight: 600 },
    Card: { borderRadiusLG: 16 },
    Table: { borderRadius: 12 },
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
