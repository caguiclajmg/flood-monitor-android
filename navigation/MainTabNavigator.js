import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import StatusScreen from '../screens/StatusScreen';
import MapScreen from '../screens/MapScreen';
import LogScreen from '../screens/LogScreen';
import StationsScreen from '../screens/StationsScreen';

const StatusStack = createStackNavigator({
    Status: StatusScreen,
});

StatusStack.navigationOptions = {
    tabBarLabel: 'Status',
    tabBarIcon: ({ focused }) => (
        <TabBarIcon
            focused={focused}
            name={Platform.OS === 'ios' ? 'ios-pulse' : 'md-pulse'}
        />
    ),
};

const MapStack = createStackNavigator({
    Map: MapScreen,
});

MapStack.navigationOptions = {
    tabBarLabel: 'Map',
    tabBarIcon: ({ focused }) => (
        <TabBarIcon
            focused={focused}
            name={Platform.OS === 'ios' ? 'ios-navigate' : 'md-navigate'}
        />
    ),
};

const LogStack = createStackNavigator({
    Log: LogScreen,
});

LogStack.navigationOptions = {
    tabBarLabel: 'Log',
    tabBarIcon: ({ focused }) => (
        <TabBarIcon
            focused={focused}
            name={Platform.OS === 'ios' ? 'ios-analytics' : 'md-analytics'}
        />
    ),
};

const StationsStack = createStackNavigator({
    Stations: StationsScreen,
});

StationsStack.navigationOptions = {
    tabBarLabel: 'Stations',
    tabBarIcon: ({ focused }) => (
        <TabBarIcon
            focused={focused}
            name={Platform.OS === 'ios' ? 'ios-globe' : 'md-globe'}
        />
    ),
};

export default createBottomTabNavigator({
    StationsStack,
    StatusStack,
    MapStack,
    LogStack
});
