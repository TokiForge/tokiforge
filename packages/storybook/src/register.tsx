import React from 'react';
import { addons, types } from '@storybook/addons';
import { AddonPanel } from '@storybook/components';
import { TOKIFORGE_PANEL_ID } from './constants';
import { TokenViewer } from './components/TokenViewer';
import { ThemeSwitcher } from './components/ThemeSwitcher';

addons.register('tokiforge', () => {
  addons.add(TOKIFORGE_PANEL_ID, {
    type: types.PANEL,
    title: 'TokiForge',
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active, key }) => (
      active ? (
        <AddonPanel active={active} key={key as React.Key}>
          <TokenViewer />
        </AddonPanel>
      ) : null
    ),
  });
});

addons.register('tokiforge-toolbar', () => {
  addons.add('tokiforge-toolbar', {
    type: types.TOOL,
    title: 'TokiForge Theme',
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <ThemeSwitcher />,
  });
});

