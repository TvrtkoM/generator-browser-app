import ReactDOM from 'react-dom';
import { FC } from 'react';

const AppComponent: FC = () => {
  return (
    <p>
      You chose to use react. Entry point is <em>./src/app.tsx</em>
    </p>
  );
};

ReactDOM.render(<AppComponent />, document.getElementById('app'));
