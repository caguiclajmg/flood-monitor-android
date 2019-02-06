import React from 'react';
import {
    StyleSheet,
    WebView,
} from 'react-native';
import { Permissions, Location } from 'expo';
import ExpoConfigView from '@expo/samples/ExpoConfigView';

export default class RouteScreen extends React.Component {
    static navigationOptions = {
        title: 'Route',
    };

    constructor(props) {
        super(props);

        this.webviewMap = React.createRef();
    }

    componentDidMount() {
        Permissions.askAsync(Permissions.LOCATION).then(() => {
            Location.watchPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 2000,
                distanceInterval: 5,
            }, loc => {
                this.webviewMap.current.postMessage(JSON.stringify(loc));
            });
        }).catch(reason => {
            console.log(reason);
        });
    }

    render() {
        return (
            <WebView
                source={{uri: Expo.Asset.fromModule(require('../assets/page/map.html')).uri}}
                ref={this.webviewMap}
                style={styles.webview}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#fff',
    },
    webview: {
        width: '100%',
    },
    controls: {

    },
});
