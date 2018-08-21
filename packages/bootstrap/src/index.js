import { withTheme, Form } from '@react-schema-form/core/src';

import templates from './components/templates';
import widgets from './components/widgets';

export { widgets, templates };
export default withTheme('Bootstrap', { widgets, templates })(Form);
