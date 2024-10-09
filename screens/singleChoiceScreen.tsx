/* eslint-disable react-native/no-inline-styles */
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native';
import {createStyleSheet, useStyles} from 'react-native-unistyles';
import {AppStackParamList} from '../App';

const ChoiceContainer = (props: {text: string; onPress: Function}) => {
  const [isSelected, setIsSelected] = useState(false);
  const {styles, theme} = useStyles(stylesheet);
  return (
    <Pressable
      style={[
        styles.choiceContainer,
        {borderColor: isSelected ? theme.colors.dark : theme.colors.light},
      ]}
      onPress={() => {
        setIsSelected(true);
        props.onPress();
      }}>
      <View style={styles.bigCircle}>
        <View style={[styles.smallCircle, {opacity: isSelected ? 1 : 0}]} />
      </View>
      <Text style={styles.text}>{props.text}</Text>
    </Pressable>
  );
};

type SingleChoiceProps = NativeStackScreenProps<
  AppStackParamList,
  'SingleChoice'
>;

const SingleChoiceScreen = ({navigation, route}: SingleChoiceProps) => {
  const word = route.params.term;
  const correctDef = route.params.correctDef;
  const allDefs = route.params.otherDefs; // TODO add the correct def to it and shuffle
  const {styles, theme} = useStyles(stylesheet);

  const checkWord = async (def: string) => {
    if (correctDef === def) {
      console.log('Correct!');
      await theme.utils.sleep(500);
      navigation.navigate('LearningMode', route.params.flashcardParams);
    } else {
      console.log('Incorrect!');
      await theme.utils.sleep(500);
      navigation.navigate('LearningMode', route.params.flashcardParams);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{word}</Text>
      {allDefs.map((def, index) => (
        <ChoiceContainer
          key={index}
          text={def}
          onPress={() => {
            checkWord(def);
          }}
        />
      ))}
    </View>
  );
};

const stylesheet = createStyleSheet(theme => ({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    top: 10,
    left: 35,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.sizes.middleTitle,
    fontWeight: '200',
    color: theme.colors.dark,
    marginBottom: 20,
  },
  choiceContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.light,
    marginVertical: 5,
    marginHorizontal: 20,
    paddingLeft: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  text: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.sizes.text,
    fontWeight: '200',
    color: theme.colors.dark,
  },
  bigCircle: {
    height: 25,
    width: 25,
    borderRadius: 25,
    borderColor: theme.colors.dark,
    borderWidth: 1.5,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCircle: {
    height: 15,
    width: 15,
    borderRadius: 15,
    backgroundColor: theme.colors.dark,
  },
}));

export default SingleChoiceScreen;
