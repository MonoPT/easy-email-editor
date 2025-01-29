import React, { useEffect } from 'react';
import { Layout, Menu, Breadcrumb } from '@arco-design/web-react';
import { Stack } from '../Stack';
import { pushEvent } from '@demo/utils/pushEvent';
import { githubButtonGenerate } from '@demo/utils/githubButtonGenerate';
import { useShowCommercialEditor } from '@demo/hooks/useShowCommercialEditor';
import { Button } from '@arco-design/web-react';
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
  useEffect(() => {
    githubButtonGenerate();
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

            <SubMenu
              key='sub1'
              title='Templates'
            >
              <Menu.Item key='1' onClick={() => window.dispatchEvent(new CustomEvent("updateTemplateTab", { detail: "1" }))}>Folder 1</Menu.Item>
              <Menu.Item key='2' onClick={() => window.dispatchEvent(new CustomEvent("updateTemplateTab", { detail: "2" }))}>Folder 2</Menu.Item>
              <Menu.Item key='3' onClick={() => window.dispatchEvent(new CustomEvent("updateTemplateTab", { detail: "3" }))}>Folder 3</Menu.Item>

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
