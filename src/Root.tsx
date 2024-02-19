import { memo } from 'react';
import { Link } from 'react-router-dom';

export const Root = memo(() => {
  return <>
    <h1>amview</h1>
    <div>
      go to a link like <Link to="./automerge:22WsmZavThRgziE9afR36ptHm2iS">this</Link>
    </div>
  </>;
});
