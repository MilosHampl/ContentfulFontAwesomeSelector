import * as React from 'react';
import { render } from 'react-dom';
import { Icon, Select, TextInput, Option } from '@contentful/forma-36-react-components';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';
import { IconDefinition, library, Library } from "@fortawesome/fontawesome-svg-core"
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const delimeter = ' ';

library.add(fas, fab);

interface AppProps {
  sdk: FieldExtensionSDK;
}

interface AppState {
  value?: string;
  pickedIcon: { prefix: string, iconName: string };
  icons: { [x: string]: IconDefinition };
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      value: props.sdk.field.getValue() || '',
      pickedIcon: {
        prefix: (props.sdk.field.getValue().split(delimeter) || '')[0] || '',
        iconName: (props.sdk.field.getValue().split(delimeter) || '')[1] || ''
      },
      icons: { ...fas, ...fab }
    };
  }

  detachExternalChangeHandler: Function | null = null;

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalChange);
  }

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  onExternalChange = (value: string) => {
    this.setState({ value });
  };

  onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const icon = this.state.icons[e.currentTarget.value];

    const value = icon.prefix + delimeter + icon.iconName;

    this.setState({ value: value });

    if (value) {
      await this.props.sdk.field.setValue(value);
    } else {
      await this.props.sdk.field.removeValue();
    }
  };

  iconLists = Object.keys(this.state.icons)
    .filter(key => key !== "faFontAwesomeLogoFull")
    .map(key => (
      <Option value={key}>
        <FontAwesomeIcon icon={[this.state.icons[key].prefix, this.state.icons[key].iconName]} />{key}
      </Option>
    ));

  render() {
    return (
      <React.Fragment>
        <Select id="icon-select" name="prefix-select" width="large" onChange={this.onChange}>
          <Option value=''>
            <FontAwesomeIcon icon={["fas", "coffee"]} /> Select icon
          </Option>
          {this.iconLists}
        </Select>
      </React.Fragment>
    );
  };
}

init(sdk => {
  render(<App sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
