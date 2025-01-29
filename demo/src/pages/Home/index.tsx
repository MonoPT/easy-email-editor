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

  //picture"https://d3k81ch9hvuctc.cloudfront.net/company/S7EvMw/images/84a89d8e-4a57-47d5-b1be-e31e28d63222.png"
  //https://assets.maocanhua.cn/5523abbd-6484-40b0-a368-bbea5e647bf4-
  let templates = JSON.parse(makeRequest("http://localhost:4000/api/templates"));



  useEffect(async () => {
    dispatch(templateList.actions.fetch(undefined));
  }, [dispatch]);


  return (
    <Frame
      title='Templates'
      primaryAction={
        <Button
          onClick={() => {
            pushEvent({ event: 'Create' });
            history.push('/editor');
          }}
        >
          Add
        </Button>
      }
    >
      <>
        <Stack>
          {[...templates, ...list].map((item) => (
            <CardItem data={item} key={item.path} />
          ))}
        </Stack>
      </>
    </Frame>
  );
}
