/* eslint-disable react/jsx-wrap-multilines */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import template from '@demo/store/template';
import { useAppSelector } from '@demo/hooks/useAppSelector';
import { useLoading } from '@demo/hooks/useLoading';
import {
  Button,
  ConfigProvider,
  Dropdown,
  Menu,
  Message,
  PageHeader,
  Select,
} from '@arco-design/web-react';
import { useQuery } from '@demo/hooks/useQuery';
import { useHistory } from 'react-router-dom';
import { cloneDeep, set, isEqual } from 'lodash';
import { Loading } from '@demo/components/loading';
import mjml from 'mjml-browser';
import services from '@demo/services';
import { IconMoonFill, IconSunFill } from '@arco-design/web-react/icon';
import { Liquid } from 'liquidjs';
import { saveAs } from 'file-saver';
import {
  BlockAvatarWrapper,
  EmailEditor,
  EmailEditorProvider,
  EmailEditorProviderProps,
  IEmailTemplate,
} from 'easy-email-editor';

import { Stack } from '@demo/components/Stack';
import { pushEvent } from '@demo/utils/pushEvent';
import { FormApi } from 'final-form';
import { UserStorage } from '@demo/utils/user-storage';

import { AdvancedType, BasicType, IBlockData, JsonToMjml } from 'easy-email-core';
import { ExtensionProps, MjmlToJson, StandardLayout } from 'easy-email-extensions';
import { AutoSaveAndRestoreEmail } from '@demo/components/AutoSaveAndRestoreEmail';

// Register external blocks
import './components/CustomBlocks';

import 'easy-email-editor/lib/style.css';
import 'easy-email-extensions/lib/style.css';
import blueTheme from '@arco-themes/react-easy-email-theme/css/arco.css?inline';
import purpleTheme from '@arco-themes/react-easy-email-theme-purple/css/arco.css?inline';
import greenTheme from '@arco-themes/react-easy-email-theme-green/css/arco.css?inline';
import { testMergeTags } from './testMergeTags';
import { useMergeTagsModal } from './components/useMergeTagsModal';

import { useWindowSize } from 'react-use';
import { CustomBlocksType } from './components/CustomBlocks/constants';
import { Uploader } from '@demo/utils/Uploader';
import enUS from '@arco-design/web-react/es/locale/en-US';

import { useShowCommercialEditor } from '@demo/hooks/useShowCommercialEditor';
import { json } from 'stream/consumers';

import html2canvas from "html2canvas";

const defaultCategories: ExtensionProps['categories'] = [
  {
    label: 'Content',
    active: true,
    blocks: [
      {
        type: AdvancedType.TEXT,
      },
      {
        type: AdvancedType.IMAGE,
        payload: { attributes: { padding: '0px 0px 0px 0px' } },
      },
      {
        type: AdvancedType.BUTTON,
      },
      {
        type: AdvancedType.SOCIAL,
      },
      {
        type: AdvancedType.DIVIDER,
      },
      {
        type: AdvancedType.SPACER,
      },
      {
        type: AdvancedType.HERO,
      },
      {
        type: AdvancedType.WRAPPER,
      },
      {
        type: AdvancedType.TABLE,
      },
    ],
  },
  {
    label: 'Layout',
    active: true,
    displayType: 'column',
    blocks: [
      {
        title: '2 columns',
        payload: [
          ['50%', '50%'],
          ['33%', '67%'],
          ['67%', '33%'],
          ['25%', '75%'],
          ['75%', '25%'],
        ],
      },
      {
        title: '3 columns',
        payload: [
          ['33.33%', '33.33%', '33.33%'],
          ['25%', '25%', '50%'],
          ['50%', '25%', '25%'],
        ],
      },
      {
        title: '4 columns',
        payload: [['25%', '25%', '25%', '25%']],
      },
    ],
  },
  {
    label: 'Custom',
    active: true,
    displayType: 'custom',
    blocks: [
      <BlockAvatarWrapper type={CustomBlocksType.PRODUCT_RECOMMENDATION}>
        <div
          style={{
            position: 'relative',
            border: '1px solid #ccc',
            marginBottom: 20,
            width: '80%',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <img
            src={
              'http://res.cloudinary.com/dwkp0e1yo/image/upload/v1665841389/ctbjtig27parugrztdhk.png'
            }
            style={{
              maxWidth: '100%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 2,
            }}
          />
        </div>
      </BlockAvatarWrapper>,
    ],
  },
];

const fontList = [
  'Arial',
  'Tahoma',
  'Verdana',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Lato',
  'Montserrat'
].map(item => ({ value: item, label: item }));

function makeRequest(url) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, false); // false makes it synchronous
  xhr.send();

  if (xhr.status === 200) {
    return xhr.responseText; // Returns response synchronously
  } else {
    return "{}";
  }
}

let fileUUID = "";
let createdTime = 0;

export default function Editor() {
  const { featureEnabled } = useShowCommercialEditor();
  const dispatch = useDispatch();
  const history = useHistory();
  const tpd = useAppSelector('template');

  let templateData = tpd;

  if (tpd) {
    let templatePath = new URLSearchParams(window.location.search).get('path')?.replaceAll("%20", "_").replaceAll(" ", "_").replaceAll("'", "");

    if (new URLSearchParams(window.location.search).get('path')) {
      let d = makeRequest(`http://localhost:3000/src/templates/${templatePath}`);
      let tp = JSON.parse(d);

      if (tp.data) {
        templateData = tp.data;
        fileUUID = templatePath?.replace(".json", "") || "";
        createdTime = tp.created_at;
      }
    }
  }

  const { id, userId } = useQuery();
  const loading = useLoading(template.loadings.fetchById);
  const { mergeTags, setMergeTags } = useMergeTagsModal(testMergeTags);

  useEffect(() => {
    if (id) {
      if (!userId) {
        UserStorage.getAccount().then(account => {
          dispatch(template.actions.fetchById({ id: +id, userId: account.user_id }));
        });
      } else {
        dispatch(template.actions.fetchById({ id: +id, userId: +userId }));
      }
    } else {
      dispatch(template.actions.fetchDefaultTemplate(undefined));
    }

    return () => {
      dispatch(template.actions.set(null));
    };
  }, [dispatch, id, userId]);

  const onUploadImage = async (blob: Blob) => {
    return services.common.uploadByQiniu(blob);
  };

  const onChangeMergeTag = useCallback((path: string, val: any) => {
    setMergeTags(old => {
      const newObj = cloneDeep(old);
      set(newObj, path, val);
      return newObj;
    });
  }, []);

  const onImportMJML = async ({
    restart,
  }: {
    restart: (val: IEmailTemplate) => void;
  }) => {
    const uploader = new Uploader(() => Promise.resolve(''), {
      accept: 'text/mjml',
      limit: 1,
    });

    const [file] = await uploader.chooseFile();
    const reader = new FileReader();
    const pageData = await new Promise<[string, IEmailTemplate['content']]>(
      (resolve, reject) => {
        reader.onload = function (evt) {
          if (!evt.target) {
            reject();
            return;
          }
          try {
            const pageData = MjmlToJson(evt.target.result as any);
            resolve([file.name, pageData]);
          } catch (error) {
            reject();
          }
        };
        reader.readAsText(file);
      },
    );

    restart({
      subject: pageData[0],
      content: pageData[1],
      subTitle: '',
    });
  };

  const onImportJSON = async ({
    restart,
  }: {
    restart: (val: IEmailTemplate) => void;
  }) => {
    const uploader = new Uploader(() => Promise.resolve(''), {
      accept: 'application/json',
      limit: 1,
    });

    const [file] = await uploader.chooseFile();
    const reader = new FileReader();
    const emailTemplate = await new Promise<IEmailTemplate>((resolve, reject) => {
      reader.onload = function (evt) {
        if (!evt.target) {
          reject();
          return;
        }
        try {
          const template = JSON.parse(evt.target.result as any) as IEmailTemplate;
          resolve(template);
        } catch (error) {
          reject();
        }
      };
      reader.readAsText(file);
    });

    restart({
      subject: emailTemplate.subject,
      content: emailTemplate.content,
      subTitle: emailTemplate.subTitle,
    });
  };

  const onExportMJML = (values: IEmailTemplate) => {
    const mjmlString = JsonToMjml({
      data: values.content,
      mode: 'production',
      context: values.content,
      dataSource: mergeTags,
    });

    
    pushEvent({ event: 'MJMLExport', payload: { values, mergeTags } });
    navigator.clipboard.writeText(mjmlString);
    saveAs(new Blob([mjmlString], { type: 'text/mjml' }), 'easy-email.mjml');
  };

  const onSaveTemplate = (values: IEmailTemplate) => {
    const mjmlString = JsonToMjml({
      data: values.content,
      mode: 'production',
      context: values.content,
      dataSource: mergeTags,
    });

    const html = mjml(mjmlString, {}).html;

    pushEvent({ event: 'SaveTemplate', payload: { values, mergeTags } });

    let container = document.createElement("div");
    container.innerHTML = html;
    
  
    //Click on preview button
    let tabWrapper = document.querySelector(".easy-email-editor-tabWrapper ._Stack_1jdgv_1 > ._Item_1jdgv_8");
    let currentActive = tabWrapper?.querySelector(".easy-email-editor-tabActiveItem")! as HTMLElement;
    tabWrapper?.querySelectorAll("button")[1].click();
    
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function screenshot() {
      await sleep(300);
      //@ts-ignore
      let DOM = document.querySelector("#easy-email-editor > div").children[2].querySelector("div > div > div > div > div").shadowRoot.querySelector(".preview-container") as HTMLElement;

      const originalStyle = {
        overflow: DOM.style.overflow,
        height: DOM.style.height,
        scrollTop: DOM.scrollTop,
      };

      DOM.scrollTop = 0;
      DOM.style.overflow = "visible";
      DOM.style.height = DOM.scrollHeight + "px";

      //CreateImageTemplate
      let canvas = await html2canvas(DOM, {useCORS: true});

      DOM.style.overflow = originalStyle.overflow;
      DOM.style.height = originalStyle.height;
      DOM.scrollTop = originalStyle.scrollTop;

      const imageBase64 = canvas.toDataURL("image/png");

      const timestamp = Math.floor(Date.now() / 1000);

      if (createdTime < 1) {
        createdTime = timestamp;
      }

      let payload = {
        uuid: fileUUID,
        title: values.subject,
        summary: values.subTitle,
        created_at: createdTime,
        updated_at: timestamp,
        folder: 1, //See best way to create new folders
        data: values,
        picture: imageBase64,
      };

      currentActive.click();

      let res = await fetch("http://localhost:4000/api/template", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json' // Set the Content-Type to JSON
        },
        body: JSON.stringify(payload)
      });

      if(res.status === 200) {
        console.log("save success")
      } else {
        console.error("could not save", res);
      }
    }
    screenshot();
  };

  const onExportHTML = (values: IEmailTemplate) => {
    const mjmlString = JsonToMjml({
      data: values.content,
      mode: 'production',
      context: values.content,
      dataSource: mergeTags,
    });

    const html = mjml(mjmlString, {}).html;

    pushEvent({ event: 'HTMLExport', payload: { values, mergeTags } });
    navigator.clipboard.writeText(html);
    saveAs(new Blob([html], { type: 'text/html' }), 'easy-email.html');
  };

  const onExportCopyHTML = (values: IEmailTemplate) => {
    const mjmlString = JsonToMjml({
      data: values.content,
      mode: 'production',
      context: values.content,
      dataSource: mergeTags,
    });

    const html = mjml(mjmlString, {}).html;

    pushEvent({ event: 'HTMLExport', payload: { values, mergeTags } });
    navigator.clipboard.writeText(html);
    //saveAs(new Blob([html], { type: 'text/html' }), 'easy-email.html');
  };

  const onExportJSON = (values: IEmailTemplate) => {
    navigator.clipboard.writeText(JSON.stringify(values, null, 2));
    saveAs(
      new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' }),
      'easy-email.json',
    );
  };

  const initialValues: IEmailTemplate | null = useMemo(() => {
    if (!templateData) return null;
    const sourceData = cloneDeep(templateData.content) as IBlockData;
    return {
      ...templateData,
      content: sourceData, // replace standard block
    };
  }, [templateData]);

  const onSubmit = useCallback(
    async (values: IEmailTemplate) => {
      console.log(values);
    },
    [dispatch, history, id, initialValues],
  );

  const onBeforePreview: EmailEditorProviderProps['onBeforePreview'] = useCallback(
    (html: string, mergeTags) => {
      const engine = new Liquid();
      const tpl = engine.parse(html);
      return engine.renderSync(tpl, mergeTags);
    },
    [],
  );

  if (!templateData && loading) {
    return (
      <Loading loading={loading}>
        <div style={{ height: '100vh' }} />
      </Loading>
    );
  }

  if (!initialValues) return null;

  return (
    <ConfigProvider locale={enUS}>
      <div>
        <style>{blueTheme}</style>
        <EmailEditorProvider
          key={id}
          height={featureEnabled ? 'calc(100vh - 108px)' : 'calc(100vh - 68px)'}
          data={initialValues}
          onUploadImage={onUploadImage}
          fontList={fontList}
          onSubmit={onSubmit}
          onChangeMergeTag={onChangeMergeTag}
          autoComplete
          dashed={false}
          mergeTags={mergeTags}
          mergeTagGenerate={tag => `{{${tag}}}`}
          onBeforePreview={onBeforePreview}
        >
          {({ values }, { submit, restart }) => {
            return (
              <>
                <PageHeader
                  style={{ background: 'var(--color-bg-2)' }}
                  backIcon
                  title='Edit'
                  onBack={() => history.push('/')}
                  extra={
                    <Stack alignment='center'>
                        <Button
                          key='Save Template'
                          onClick={() => onSaveTemplate(values)}
                        >
                          <strong>Save</strong>
                        </Button>

                      <Dropdown
                        droplist={
                          <Menu>
                            <Menu.Item
                              key='MJML'
                              onClick={() => onImportMJML({ restart })}
                            >
                              Import from MJML
                            </Menu.Item>

                            <Menu.Item
                              key='JSON'
                              onClick={() => onImportJSON({ restart })}
                            >
                              Import from JSON
                            </Menu.Item>
                          </Menu>
                        }
                      >
                        <Button>
                          <strong>Import</strong>
                        </Button>
                      </Dropdown>

                      <Dropdown
                        droplist={
                          <Menu>
                            <Menu.Item
                              key='Export MJML'
                              onClick={() => onExportMJML(values)}
                            >
                              Export MJML
                            </Menu.Item>
                            <Menu.Item
                              key='Export HTML'
                              onClick={() => onExportHTML(values)}
                            >
                              Export HTML
                            </Menu.Item>

                            <Menu.Item
                              key='Copy HTML'
                              onClick={() => onExportCopyHTML(values)}
                            >
                              Copy HTML
                            </Menu.Item>

                            <Menu.Item
                              key='Export JSON'
                              onClick={() => onExportJSON(values)}
                            >
                              Export JSON
                            </Menu.Item>
                          </Menu>
                        }
                      >
                        <Button>
                          <strong>Export</strong>
                        </Button>
                      </Dropdown>
                      
                    </Stack>
                  }
                />

                <StandardLayout categories={defaultCategories}>
                  <EmailEditor />
                </StandardLayout>
                <AutoSaveAndRestoreEmail />
              </>
            );
          }}
        </EmailEditorProvider>
      </div>
    </ConfigProvider>
  );
}
