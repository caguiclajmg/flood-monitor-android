import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Asset, Font, Icon, Notifications } from 'expo';
import AppNavigator from './navigation/AppNavigator';

export default class App extends React.Component {
    state = {
        isLoadingComplete: false,
    };

    componentDidMount() {
        this._checkWaterLevel();
    }

    render() {
        if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
            return (
                <AppLoading
                    startAsync={this._loadResourcesAsync}
                    onError={this._handleLoadingError}
                    onFinish={this._handleFinishLoading}
                />
            );
        } else {
            return (
                <View style={styles.container}>
                    {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
                    <AppNavigator />
                </View>
            );
        }
    }

    _loadResourcesAsync = async () => {
        return Promise.all([
            Asset.loadAsync([
                require('./assets/images/robot-dev.png'),
                require('./assets/images/robot-prod.png'),
            ]),
            Font.loadAsync({
                // This is the font that we are using for our tab bar
                ...Icon.Ionicons.font,
                // We include SpaceMono because we use it in HomeScreen.js. Feel free
                // to remove this if you are not using it in your app
                'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
            }),
        ]);
    };

    _handleLoadingError = error => {
        // In this case, you might want to report the error to your error
        // reporting service, for example Sentry
        console.warn(error);
    };

    _handleFinishLoading = () => {
        this.setState({ isLoadingComplete: true });
    };

    _checkWaterLevel = async () => {
        try {
            const response = await fetch('https://flood-monitor.herokuapp.com/api/mobile/status');
            if(response.status !== 200) throw new Error('Invalid response from server');

            const json = await response.json();

            json.forEach((station) => {
                station.level *= 0.3048;

                if(station.level > 0.9144) {
                    Notifications.presentLocalNotificationAsync({
                        title: 'Flood Warning',
                        body: `Water level at ${station.name} is now ${station.level}m`
                    });
                }
            });
        } finally {
            setTimeout(this._checkWaterLevel, 30 * 1000);
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
