import { App } from '@/App';
import { AuthProvider } from '@/components/ContextAuth';
import { I18nProvider } from '@/i18n';
import { ThemeProvider } from '@/theme';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import './styles/tailwind.css';

const routerBasename =
  import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <HelmetProvider>
      <BrowserRouter
        basename={routerBasename}
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <I18nProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    </HelmetProvider>
  </ThemeProvider>
);
