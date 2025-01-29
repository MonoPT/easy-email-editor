import React from 'react';
import {
  ColorPickerField,
  InputWithUnitField,
  NumberField,
  TextAreaField,
  TextField,
} from '@extensions/components/Form';
import { AddFont } from '@extensions/components/Form/AddFont';
import { Collapse, Grid, Space } from '@arco-design/web-react';
import { Stack, useFocusIdx } from 'easy-email-editor';
import { AttributesPanelWrapper } from '@extensions/AttributePanel/components/attributes/AttributesPanelWrapper';
import { FontFamily } from '../../attributes/FontFamily';
import { pixelAdapter } from '../../adapter';
import { SelectField } from '../../../../components/Form';
import { useState, useEffect } from 'react';
import './style.css';


interface PageProps { hideSubTitle?: boolean; hideSubject?: boolean; }
export function Page({ hideSubTitle, hideSubject }: PageProps) {
  const { focusIdx } = useFocusIdx();

  if (!focusIdx) return null;

  const [folders, setFolders] = useState([]);
  const [selectedFolder, setselectedFolder] = useState("None");
  const [selectedFolderId, setselectedFolderId] = useState("0");


  useEffect(async () => {
    let f = await (await fetch("http://localhost:4000/api/folders")).json();

    setFolders(f);

    const selectFolder = (e) => {
      setselectedFolder(e.detail.name);
      setselectedFolderId(e.detail.id);
    };

    window.addEventListener("handleSelectFolder", selectFolder);

    return () => {
      window.removeEventListener("handleSelectFolder", selectFolder);
    };
  }, []);

  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <Stack.Item fill>
        <Collapse defaultActiveKey={['0', '1', '2']}>
          <Collapse.Item
            name='2'
            header={t('Template Settings')}
          >
            <Space direction='vertical'>
              <div style={{ position: "relative" }}>
                {selectedFolder}
                <input type="hidden" value={selectedFolderId}></input>
                <div id="folderOptions">

                  {folders.map((folder) => (
                    <span key={folder.id}>
                      <label className='folder'>{folder.folderName}</label>
                      {
                        folder.subfolders.map((item) => ( //Submenus
                          <label key={item.id} className='subfolder' onClick={() => { window.dispatchEvent(new CustomEvent("handleSelectFolder", { detail: { id: item.id, name: item.name } })); }}>{item.name}</label>
                        ))
                      }
                    </span>
                  ))}
                </div>
              </div>
            </Space>
          </Collapse.Item>
          <Collapse.Item
            name='0'
            header={t('Email Settings')}
          >
            <Space direction='vertical'>
              {!hideSubject && (
                <TextField
                  label={t('Subject')}
                  name={'subject'}
                  inline
                />
              )}
              {!hideSubTitle && (
                <TextField
                  label={t('SubTitle')}
                  name={'subTitle'}
                  inline
                />
              )}
              <InputWithUnitField
                label={t('Width')}
                name={`${focusIdx}.attributes.width`}
                inline
              />
              <InputWithUnitField
                label={t('Breakpoint')}
                helpText={t(
                  'Allows you to control on which breakpoint the layout should go desktop/mobile.',
                )}
                name={`${focusIdx}.data.value.breakpoint`}
                inline
              />
            </Space>
          </Collapse.Item>
          <Collapse.Item
            name='1'
            header={t('Theme Setting')}
          >
            <Stack
              vertical
              spacing='tight'
            >
              <Grid.Row>
                <Grid.Col span={11}>
                  <FontFamily name={`${focusIdx}.data.value.font-family`} />
                </Grid.Col>
                <Grid.Col
                  offset={1}
                  span={11}
                >
                  <NumberField
                    label='Font size (px)'
                    name={`${focusIdx}.data.value.font-size`}
                    config={pixelAdapter}
                    autoComplete='off'
                  />
                </Grid.Col>
              </Grid.Row>

              <Grid.Row>
                <Grid.Col span={11}>
                  <InputWithUnitField
                    label={t('Line height')}
                    unitOptions='percent'
                    name={`${focusIdx}.data.value.line-height`}
                  />
                </Grid.Col>
                <Grid.Col
                  offset={1}
                  span={11}
                >
                  <InputWithUnitField
                    label={t('Font weight')}
                    unitOptions='percent'
                    name={`${focusIdx}.data.value.font-weight`}
                  />
                </Grid.Col>
              </Grid.Row>

              <Grid.Row>
                <Grid.Col span={11}>
                  <ColorPickerField
                    label={t('Text color')}
                    name={`${focusIdx}.data.value.text-color`}
                  />
                </Grid.Col>
                <Grid.Col
                  offset={1}
                  span={11}
                >
                  <ColorPickerField
                    label={t('Background')}
                    name={`${focusIdx}.attributes.background-color`}
                  />
                </Grid.Col>
              </Grid.Row>

              <Grid.Row>
                <ColorPickerField
                  label={t('Content background')}
                  name={`${focusIdx}.data.value.content-background-color`}
                />
              </Grid.Row>

              <TextAreaField
                autoSize
                label={t('User style')}
                name={`${focusIdx}.data.value.user-style.content`}
              />
              <Stack.Item />
              <Stack.Item />
              <AddFont />
              <Stack.Item />
              <Stack.Item />
            </Stack>
          </Collapse.Item>
        </Collapse>
      </Stack.Item>
    </AttributesPanelWrapper>
  );
}
