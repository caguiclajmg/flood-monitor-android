import React from 'react';
import {
    ListView,
    StyleSheet,
    Text,
    View,
    RefreshControl,
    TextInput,
    Button,
    Modal,
    TouchableOpacity
} from 'react-native';

export default class StationsScreen extends React.Component {
    static navigationOptions = {
        title: 'Stations',
    };

    constructor(props) {
        super(props);

        this.state = {
            refreshing: false,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2
            }),
            stations: [],
            modalVisible: false,
            editId: null,
            editName: null,
            editLatitude: null,
            editLongitude: null
        }
    }

    componentDidMount() {
        this._onRefresh();
    }

    render() {
        return (
            <View style={styles.root}>
                <View style={styles.table}>
                    <ListView
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
                <Modal
                    visible={this.state.modalVisible}
                    onRequestClose={this._closeEditModal}
                    animationType={'slide'}
                    transparent={true}
                    style={styles.modal}>
                    <View style={styles.inputField}>
                        <Text>ID</Text>
                        <TextInput
                            value={this.state.editId}
                            editable={false}
                            onChangeText={(value) => this.setState({ editId: value })}
                        />
                    </View>
                    <View style={styles.inputField}>
                        <Text>Name</Text>
                        <TextInput
                            value={this.state.editName}
                            onChangeText={(value) => this.setState({ editName: value })}
                        />
                    </View>
                    <View style={styles.inputField}>
                        <Text>Latitude</Text>
                        <TextInput
                            value={this.state.editLatitude}
                            onChangeText={(value) => this.setState({ editLatitude: value })}
                        />
                    </View>
                    <View style={styles.inputField}>
                        <Text>Longitude</Text>
                        <TextInput
                            value={this.state.editLongitude}
                            onChangeText={(value) => this.setState({ editLongitude: value })}
                        />
                    </View>
                    <View style={styles.inputField}>
                        <Button
                            onPress={() => this._closeEditModal(true)}
                            title={'Save'}
                        />
                        <Button
                            onPress={() => this._closeEditModal(false)}
                            title={'Cancel'}
                        />
                    </View>
                </Modal>
            </View>
        );
    }

    _showEditModal = (data) => {
        this.setState({
            modalVisible: true,
            editId: `${data.id}`,
            editName: data.name,
            editLatitude: `${data.latitude}`,
            editLongitude: `${data.longitude}`
        });
    }

    _closeEditModal = async (save) => {
        this.setState({ modalVisible: false });

        if(save) {
            const response = await fetch(`https://flood-monitor.herokuapp.com/station/${this.state.editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.state.editName,
                    latitude: this.state.editLatitude,
                    longitude: this.state.longitude
                })
            });

            if(response.status !== 200) return;

            const json = await response.json();

            this._onRefresh();
        }
    }

    _setStationsData = (data) => {
        this.state.stations = data;
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.state.stations)
        });
    }

    _onRefresh = async () => {
        this.setState({ refreshing: true });

        try {
            const response = await fetch('https://flood-monitor.herokuapp.com/api/station');
            const stations = await response.json();
            this._setStationsData(stations);
        } finally {
            this.setState({ refreshing: false });
        }
    };

    _renderRow = (data) => {
        return (
            <TouchableOpacity
                style={styles.row}
                onPress={() => this._showEditModal(data)}>
                <Text style={[styles.cell, { width: '10%' }]}>{data.id}</Text>
                <Text style={[styles.cell, { width: '60%' }]}>{data.name}</Text>
                <View style={[styles.cell, { width: '30%' }]}>
                    <Text style={{ fontSize: 10 }}>{data.latitude}&deg;</Text>
                    <Text style={{ fontSize: 10 }}>{data.longitude}&deg;</Text>
                </View>
            </TouchableOpacity>
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
    modal: {
    },
    inputField: {
        flex: 1,
        flexDirection: 'row'
    }
});
