import React, { useEffect } from 'react';
import { Layout, Menu, Breadcrumb } from '@arco-design/web-react';
import { Stack } from '../Stack';
import { pushEvent } from '@demo/utils/pushEvent';
import { githubButtonGenerate } from '@demo/utils/githubButtonGenerate';
import { useShowCommercialEditor } from '@demo/hooks/useShowCommercialEditor';
import { Button } from '@arco-design/web-react';
import { useState } from 'react';
import { IconEdit, IconDelete } from '@arco-design/web-react/icon';


import './style.css';
import './contextMenu';

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
    const folders = await (await fetch("http://localhost:4000/api/folders")).json();

    setFolders(folders);

    const handleUpdateTemplateTab = (e) => {
      folderSelected = e.detail;

      if (e.detail === "0") {
        window.dispatchEvent(new CustomEvent("UpdateSelectedFolderName", { detail: "All Templates" }));
        return;
      }

      folders.forEach(element => {
        let folder = element.folderName;

        element.subfolders.forEach(element => {
          if (element.id === e.detail) {
            window.dispatchEvent(new CustomEvent("UpdateSelectedFolderName", { detail: `${folder} / ${element.name}` }));
          }
        });
      });
    };



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
                className={`MenuItemTemplateFolder`}
              >

                {item.subfolders.map((item) => ( //Submenus
                  <Menu.Item className={`MenuItemTemplateSubfolder`} key={item.id} onClick={() => window.dispatchEvent(new CustomEvent("updateTemplateTab", { detail: item.id }))}>{item.name}</Menu.Item>
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
