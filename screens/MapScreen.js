import React from 'react';
import {
    StyleSheet,
    WebView,
} from 'react-native';
import { Location, Permissions } from 'expo';

export default class MapScreen extends React.Component {
    static navigationOptions = {
        title: 'Map',
    };

    constructor(props) {
        super(props);

        this.webviewMap = React.createRef();
    }

    componentDidMount() {
        Permissions.askAsync(Permissions.LOCATION).then(() => {
            Location.watchPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 4000,
                distanceInterval: 5,
            }, (loc) => {
                this.webviewMap.current.postMessage(JSON.stringify({ origin: loc }));
            });
        }).catch(() => {});
    }

    render() {
        return (
            <WebView
                source={{uri: Expo.Asset.fromModule(require('../assets/page/map.html')).uri}}
                ref={this.webviewMap}
                mixedContentMode={'always'}
                allowUniversalAccessFromFileURLs={true}
                javaScriptEnabled={true}
                geolocationEnabled={true}
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
