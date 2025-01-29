import React, { useEffect } from 'react';
import { Layout, Menu, Breadcrumb } from '@arco-design/web-react';
import { Stack } from '../Stack';
import { pushEvent } from '@demo/utils/pushEvent';
import { githubButtonGenerate } from '@demo/utils/githubButtonGenerate';
import { useShowCommercialEditor } from '@demo/hooks/useShowCommercialEditor';
import { Button } from '@arco-design/web-react';
import { useState } from 'react';

import './style.css';


const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

interface FrameProps {
  title: string;
  breadcrumb?: React.ReactElement;
  primaryAction?: React.ReactElement;
  children: React.ReactElement;
}

export default function Frame({
  children,
  title,
  primaryAction,
  breadcrumb,
}: FrameProps) {

  let folderSelected = "0";

  const [folders, setFolders] = useState([]);

  useEffect(async () => {
    const handleUpdateTemplateTab = (e) => {
      folderSelected = e.detail;
    };

    setFolders(await (await fetch("http://localhost:4000/api/folders")).json());

    window.addEventListener('updateTemplateTab', handleUpdateTemplateTab);

    return () => {
      window.removeEventListener('updateTemplateTab', handleUpdateTemplateTab);
    };
  }, []);

  const { featureEnabled } = useShowCommercialEditor();

  return (
    <Layout>
      <Header style={{ padding: '0 20px', backgroundColor: '#001529' }}>
        <Stack
          distribution='equalSpacing'
          alignment='center'
        >
          <h1 style={{ color: 'white', margin: '15px 0' }}>Easy-email</h1>

          <div style={{ marginTop: 10 }}>

          </div>
        </Stack>
      </Header>

      <Layout>
        <Sider width={200}>
          <Menu
            defaultSelectedKeys={['0']}
            defaultOpenKeys={['sub1']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Button
              className={"CreateFolderButton"}
              onClick={() => {
                //pushEvent({ event: 'Create' });
                //history.push('/editor');
                alert("Create Folder");
              }}
            >
              Create new folder
            </Button>

            <Menu.Item key='0' onClick={() => window.dispatchEvent(new CustomEvent("updateTemplateTab", { detail: "0" }))}>All Templates</Menu.Item>

            {[...folders].map((item) => ( // Folders
              <SubMenu
                key={item.id}
                title={item.folderName}
              >

                {item.subfolders.map((item) => ( //Submenus
                  <Menu.Item key={item.id} onClick={() => window.dispatchEvent(new CustomEvent("updateTemplateTab", { detail: item.id }))}>{item.name}</Menu.Item>
                ))}

                <Button
                  className={"CreateSubFolderButton"}
                  onClick={() => {
                    //pushEvent({ event: 'Create' });
                    //history.push('/editor');
                    alert("Create sub Folder");
                  }}
                >
                  Create new subfolder
                </Button>
              </SubMenu>

            ))}

          </Menu>
        </Sider>
        <Layout style={{ padding: 24 }}>
          <Stack vertical>
            {breadcrumb && (
              <Breadcrumb>
                <Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
              </Breadcrumb>
            )}

            <Stack
              distribution='equalSpacing'
              alignment='center'
            >
              <Stack.Item>
                <h2>
                  <strong>{title}</strong>
                </h2>
              </Stack.Item>
              <Stack.Item>{primaryAction}</Stack.Item>
            </Stack>

            <Stack.Item>
              <Content
                style={{
                  padding: 24,
                  margin: 0,
                  backgroundColor: '#fff',
                }}
              >
                {children}
              </Content>
            </Stack.Item>
          </Stack>
        </Layout>
      </Layout>
    </Layout>
  );
}
