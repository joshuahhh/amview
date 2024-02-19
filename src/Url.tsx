import { memo, useCallback, useRef } from 'react';
import ReactJsonView, { CollapsedFieldProps, InteractionProps } from '@microlink/react-json-view';
import { useParams } from 'react-router-dom';
import { AutomergeUrl, Repo } from "@automerge/automerge-repo";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { RepoContext, useDocument } from "@automerge/automerge-repo-react-hooks";


export const Url = memo(() => {
  const repoRef = useRef<Repo>();
  if (!repoRef.current) {
    const networkAdapter = new BrowserWebSocketClientAdapter("wss://sync.automerge.org", 500);
    repoRef.current = new Repo({ network: [ networkAdapter ] });
  }

  return <RepoContext.Provider value={repoRef.current}>
    <UrlInner />
  </RepoContext.Provider>;
});

const UrlInner = memo(() => {
  const { url } = useParams();
  const [doc, changeDoc] = useDocument(url as AutomergeUrl | undefined);

  const onEdit = useCallback(({namespace, new_value, name}: InteractionProps) => {
    // console.log("onEdit", {namespace, new_value, name}); return false;
    changeDoc(function (doc) {
      let current: any = doc;
      for (const key of namespace) {
        if (key === null) {
          throw new Error("unexpected null key");
        }
        current = current[key];
      }
      if (name === null) {
        throw new Error("unexpected null name");
      }
      current[name] = new_value;
    });
    return false;
  }, [changeDoc]);

  const onAdd = useCallback(({namespace, new_value, existing_value, name}: InteractionProps) => {
    // console.log("onAdd", {namespace, new_value, name}); return false;
    changeDoc(function (doc) {
      let current: any = doc;
      for (const key of namespace) {
        if (key === null) {
          throw new Error("unexpected null key");
        }
        current = current[key];
      }
      if (name !== null) {
        current = current[name];
      }
      for (const key in (new_value as any)) {
        if (!(key in (existing_value as any))) {
          current[key] = (new_value as any)[key];
        }
      }
    });
    return false;
  }, [changeDoc]);

  const onDelete = useCallback(({namespace, name}: InteractionProps) => {
    // console.log("onDelete", {namespace, name}); return false;
    changeDoc(function (doc) {
      let current: any = doc;
      for (const key of namespace) {
        if (key === null) {
          throw new Error("unexpected null key");
        }
        current = current[key];
      }
      if (name === null) {
        throw new Error("unexpected null name");
      }
      delete current[name];
    });
    return false;
  }, [changeDoc]);

  const shouldCollapse = useCallback(({namespace}: CollapsedFieldProps) => {
    // this is a hack to avoid showing Uint8Arrays
    // ideally we would customize rendering of Uint8Arrays, but we can't
    // (because this library is bad)

    // note: the meaning of namespace & name here are different from above callbacks
    // (because this library is bad)

    let current: any = doc;
    for (const key of namespace.slice(1)) {
      if (key === null) {
        throw new Error("unexpected null key");
      }
      current = current[key];
    }
    for (const key in current) {
      if (current[key] instanceof Uint8Array) {
        return true;
      }
    }
    return false;
  }, [doc]);

  return <>
    <h1>amview <span style={{fontStyle: "italic", fontSize: 'initial', fontWeight: 'initial'}}>{url}</span></h1>
    <div>
      { doc
        ? <ReactJsonView
            src={doc}
            onEdit={onEdit}
            onAdd={onAdd}
            onDelete={onDelete}
            shouldCollapse={shouldCollapse}
          />
        : "loading..."
      }
    </div>
  </>;
});
