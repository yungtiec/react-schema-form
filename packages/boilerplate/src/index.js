import { withTheme, Form } from '@react-schema-form/core';

import widgets from './widgets';
import templates from './templates';

export default withTheme('Bootstrap', { widgets, templates })(Form);
