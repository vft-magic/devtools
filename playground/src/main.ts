import { createApp } from 'vue';

import TMagicApp from '@tmagic/core';
import { getUrlParam } from '@tmagic/utils';
import Button from '@tmagic/vue-button';
import Container from '@tmagic/vue-container';
import Img from '@tmagic/vue-img';
import IteratorContainer from '@tmagic/vue-iterator-container';
import Overlay from '@tmagic/vue-overlay';
import Page from '@tmagic/vue-page';
import PageFragment from '@tmagic/vue-page-fragment';
import PageFragmentContainer from '@tmagic/vue-page-fragment-container';
import Text from '@tmagic/vue-text';

import AppComponent from './App.vue';
import dsl from './dsl';

const tmagicApp = new TMagicApp({
  ua: window.navigator.userAgent,
  config: dsl,
  curPage: getUrlParam('page'),
  useMock: Boolean(getUrlParam('useMock')),
});

tmagicApp.setDesignWidth(tmagicApp.env.isWeb ? window.document.documentElement.getBoundingClientRect().width : 375);

const app = createApp(AppComponent);

app.provide('app', tmagicApp);

app.component('magic-ui-button', Button);
app.component('magic-ui-container', Container);
app.component('magic-ui-img', Img);
app.component('magic-ui-iterator-container', IteratorContainer);
app.component('magic-ui-overlay', Overlay);
app.component('magic-ui-page', Page);
app.component('magic-ui-page-fragment', PageFragment);
app.component('magic-ui-page-fragment-container', PageFragmentContainer);
app.component('magic-ui-page-fragment-text', Text);

app.mount('#app');
