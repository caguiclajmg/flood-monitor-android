import React from 'react';
import {
    Image,
    ListView,
    StyleSheet,
    Text,
    View,
    RefreshControl,
} from 'react-native';
import Touchable from 'react-native-platform-touchable';

export default class StatusScreen extends React.Component {
    static navigationOptions = {
        title: 'Status',
    };

    constructor() {
        super();

        this.state = {
            refreshing: false,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2
            }),
            stations: [],
        };
    }

    componentDidMount() {
        this._onRefresh();
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <ListView
                    style={styles.container}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }
                    dataSource={this.state.dataSource}
                    renderRow={(station) => this._renderRow(station)}
                    enableEmptySections={true}
                />
            </View>
        );
    }

    _onRefresh = async () => {
        this.setState({refreshing: true});

        try {
            const response = await fetch('https://flood-monitor.herokuapp.com/api/mobile/status');
            const stations = await response.json();

            this.state.stations = stations;
            this.setState({dataSource: this.state.dataSource.cloneWithRows(this.state.stations)});
        } finally {
            this.setState({refreshing: false});
        }
    }

    _renderRow(station) {
        return (
            <View style={styles.station}>
                <View style={styles.imageContainer}>
                    <Text>{station.id}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.property}>
                        <Text style={styles.propertyLabel}>Name</Text>
                        <Text style={styles.propertyValue}>{station.name}</Text>
                    </View>
                    <View style={styles.property}>
                        <Text style={styles.propertyLabel}>Location</Text>
                        <Text style={styles.propertyValue}>{`${station.latitude}, ${station.longitude}`}</Text>
                    </View>
                    <View style={styles.property}>
                        <Text style={styles.propertyLabel}>Level</Text>
                        <Text style={styles.propertyValue}>{station.level}ft</Text>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    station: {
        paddingTop: 5,
        paddingBottom: 5,

        backgroundColor: '#fff',

        flexDirection: 'row',

        borderColor: '#8E8E8E',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    imageContainer: {
        width: '25%',
        alignItems: 'center',
    },

    infoContainer: {
        width: '75%',
        flexDirection: 'column',
    },

    property: {
        flexDirection: 'row',
    },

    propertyLabel: {
        width: '25%',
        color: '#444',
    },

    propertyValue: {
        width: '75%',
        color: '#000',
    },
});
