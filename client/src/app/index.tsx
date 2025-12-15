import {AppProvider} from './provider';
import {AppRouter} from './routing';

const App = () => {
    return (
        <AppProvider>
            <AppRouter />
        </AppProvider>
    );
};

export default App;
