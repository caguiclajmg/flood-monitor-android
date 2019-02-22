import React from 'react';
import {
    ListView,
    StyleSheet,
    Text,
    View,
    RefreshControl,
    Picker,
    TextInput,
    Button
} from 'react-native';
import moment from 'moment';

export default class LogScreen extends React.Component {
    static navigationOptions = {
        title: 'Log',
    };

    constructor(props) {
        super(props);

        this.refs = {
            logTable: React.createRef(),
            stationPicker: React.createRef(),
            levelTextInput: React.createRef()
        };

        this.state = {
            refreshing: false,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2
            }),
            log: [],
            stations: [],
            selectedStation: '',
            levelInput: ''
        }
    }

    componentDidMount() {
        this._loadStations();
        this._onRefresh();
    }

    _loadStations = async () => {
        const response = await fetch('https://flood-monitor.herokuapp.com/api/station');
        const json = await response.json();

        this.setState({
            stations: json
        });
    }

    render() {
        return (
            <View style={styles.root}>
                <View style={styles.table}>
                    <ListView
                        ref={this.refs.logTable}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}
                            />
                        }
                        dataSource={this.state.dataSource}
                        renderRow={this._renderRow}
                        enableEmptySections={true}
                    />
                </View>
                <View style={styles.form}>
                    <View style={styles.field}>
                        <Picker
                            ref={this.refs.stationPicker}
                            selectedValue={this.state.selectedStation}
                            onValueChange={(value, index) => {
                                this.setState({ selectedStation: value });
                            }}>
                            {
                                this.state.stations.map((station, index) => <Picker.Item key={index} label={station.name} value={station.id} />)
                            }
                        </Picker>
                    </View>
                    <View style={styles.field}>
                        <TextInput
                            ref={this.refs.levelTextInput}
                            placeholder={'Water Level in m'}
                            onChangeText={(level) => this.setState({ levelInput: level })}
                        />
                    </View>
                    <View style={styles.field}>
                        <Button title={'Add'} onPress={this._addEntry} />
                    </View>
                </View>
            </View>
        );
    }

    _addEntry = async () => {
        const data = {
            station: this.state.selectedStation,
            level: parseFloat(this.state.levelInput) * 3.28084
        };

        const response = await fetch('https://flood-monitor.herokuapp.com/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const json = await response.json();
        console.log(json[0]);
        this._setLogData([...this.state.log, json[0]]);
    }

    _setLogData = (data) => {
        this.state.log = data;
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.state.log)
        });
    }

    _onRefresh = async () => {
        this.setState({ refreshing: true });

        try {
            const response = await fetch('https://flood-monitor.herokuapp.com/api/log');
            const log = await response.json();
            this._setLogData(log);
        } finally {
            this.setState({ refreshing: false });
        }
    };

    _renderRow = (data) => {
        return (
            <View style={styles.row}>
                <Text style={[styles.cell, { width: '15%' }]}>{data.station}</Text>
                <Text style={[styles.cell, { width: '55%' }]}>{moment(data.timestamp).format('LLL')}</Text>
                <Text style={[styles.cell, { width: '30%' }]}>{(data.level * 0.3048).toFixed(4)}m</Text>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: 'column'
    },
    table: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',

        borderColor: '#8E8E8E',
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'stretch',

        paddingTop: 5,
        paddingBottom: 5,

        borderColor: '#8E8E8E',
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    cell: {
        textAlign: 'center',
        alignSelf: 'stretch'
    },
    form: {
        flexDirection: 'row',
    },
    field: {
        flex: 1,
        justifyContent: 'center'
    }
});
