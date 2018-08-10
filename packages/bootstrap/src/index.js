import { withTheme, Form } from '@react-schema-form/core';

import templates from './components/templates';
import widgets from './components/widgets';

const theme = { templates, widgets };

export default withTheme('Bootstrap', theme)(Form);
