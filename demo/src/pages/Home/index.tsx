import './override.css';
import { useAppSelector } from '@demo/hooks/useAppSelector';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Frame from '@demo/components/Frame';
import templateList from '@demo/store/templateList';
import { Button } from '@arco-design/web-react';
import { CardItem } from './components/CardItem';
import { Stack } from '@demo/components/Stack';
import { history } from '@demo/utils/history';
import { pushEvent } from '@demo/utils/pushEvent';
import templates from '@demo/config/templates.json';

import { useState } from 'react';


function makeRequest(url) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, false); // false makes it synchronous
  xhr.send();

  if (xhr.status === 200) {
    return xhr.responseText; // Returns response synchronously
  } else {
    return "[]";
  }
}

export default function Home() {
  const dispatch = useDispatch();
  const list = useAppSelector('templateList');
  const [categoria, setCategoria] = useState("0");
  const [subfolder, setSubfolder] = useState("All Templates");

  let templates = JSON.parse(makeRequest("http://localhost:4000/api/templates"));

  useEffect(async () => {
    dispatch(templateList.actions.fetch(undefined));

    const handleUpdateTemplateTab = (e) => {
      setCategoria(e.detail);
    };

    const updateFolderName = (e) => {
      setSubfolder(e.detail);
    };

    window.addEventListener('updateTemplateTab', handleUpdateTemplateTab);
    window.addEventListener('UpdateSelectedFolderName', updateFolderName);

    return () => {
      window.removeEventListener('updateTemplateTab', handleUpdateTemplateTab);
      window.removeEventListener('UpdateSelectedFolderName', updateFolderName);
    };
  }, [dispatch]);




  return (
    <Frame
      title={subfolder}
      primaryAction={
        <Button
          onClick={() => {
            console.log(categoria);
            pushEvent({ event: 'Create' });
            history.push('/editor?folder=' + categoria);
          }}
        >
          Add
        </Button>
      }
    >
      <>
        <Stack>
          {[...templates, ...list].map((item) => (
            item.folder === categoria || categoria === "0" ? (<CardItem data={item} key={item.path} />) : null

          ))}
        </Stack>
      </>
    </Frame>
  );
}
