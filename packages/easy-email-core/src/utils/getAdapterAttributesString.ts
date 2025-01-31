import { IBlock } from '@core/typings';
import { EMAIL_BLOCK_CLASS_NAME } from '@core/constants';

import { isString } from 'lodash';

import { classnames } from '@core/utils/classnames';
import { getNodeIdxClassName, getNodeTypeClassName } from '@core/utils';

export function getAdapterAttributesString(
  params: Parameters<IBlock['render']>[0]
) {

  const { data, idx } = params;



  const isTest = params.mode === 'testing';
  const attributes = { ...data.attributes };
  const keepClassName = isTest ? params.keepClassName : false;

  if (data.attributes['display-device']) {
    let class_render_on = "";

    if (data.attributes['display-device'] === "mobile") {
      class_render_on = "mobile-only";
    } else if (data.attributes['display-device'] === "desktop") {
      class_render_on = "desktop-only";
    }

    attributes['css-class'] = `${attributes['css-class']} ${class_render_on}`;
  }

  if (isTest && idx) {
    attributes['css-class'] = classnames(
      attributes['css-class'],
      EMAIL_BLOCK_CLASS_NAME,
      getNodeIdxClassName(idx),
      getNodeTypeClassName(data.type)
    );
  }

  if (keepClassName) {
    attributes['css-class'] = classnames(
      attributes['css-class'],
      getNodeTypeClassName(data.type),
      "insertedClassName"
    );
  }

  let attributeStr = '';
  for (let key in attributes) {
    const keyName = key as keyof typeof attributes;
    const val = attributes[keyName];
    if (isString(val) && val) {
      const splitter = ' ';
      attributeStr += `${key}="${val.replace(/"/gm, '')}"` + splitter;
    }
  }

  return attributeStr;
}
