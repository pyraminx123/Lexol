/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {View, FlatList, SafeAreaView, TextInput} from 'react-native';
import Card, {addCardToDatabase} from './components/Card';
import SaveButton from './components/SaveButton';
import {createStyleSheet, useStyles} from 'react-native-unistyles';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '../App';
import {deleteEntryInDeck, changeDeckName} from './handleData';
import AddCard from './components/addCard';
import {wordObj} from './types';

type WordsProps = NativeStackScreenProps<AppStackParamList, 'Words'>;

const WordScreen = ({route, navigation}: WordsProps) => {
  const emptyCard = {
    deckID: -1,
    definition: '',
    difficulty: 0,
    due: new Date(),
    elapsed_days: 0,
    id: -1,
    lapses: 0,
    last_review: new Date(),
    reps: 0,
    scheduled_days: -1,
    stability: -1,
    state: 0, // Ensure the state matches the wordObj type
    term: '',
  };
  //const currentUsedIds = route.params.data.map(card => card.id);
  //console.log(currentUsedIds);
  const initialData = [...route.params.data, emptyCard];
  const deckName = route.params.originalDeckName;
  const [data, setData] = useState(initialData);
  const [text, onChangeText] = useState(deckName);
  //console.log('initial', data);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => SaveButton(onSave),
    });
  }, [text, data]);

  const deleteCard = async (id: number, deckId: number) => {
    console.log(data);
    if (deckId !== -1) {
      await deleteEntryInDeck(route.params.uniqueDeckName, id);
      const newData = data.filter(card => card.id !== id);
      setData(newData);
      // delete empty card
    } else {
      const newData = data.filter(card => card.id !== id);
      setData(newData);
    }
  };

  const updateCard = (index: number, term: string, definition: string) => {
    setData(prevData => {
      //console.log('prev', prevData, prevData[index]);
      prevData[index].term = term;
      prevData[index].definition = definition;
      return [...prevData];
    });
  };
  // TODO differentiate between new and old cards
  const onSave = async () => {
    for (const item of data) {
      if (item.term && item.definition) {
        await addCardToDatabase({
          term: item.term,
          definition: item.definition,
          id: item.id,
          deckId: item.deckID,
          uniqueDeckName: route.params.uniqueDeckName,
          uniqueFolderName: route.params.uniqueFolderName,
        });
      }
    }
    await changeDeckName(
      route.params.uniqueFolderName,
      text,
      route.params.uniqueDeckName,
    );
    navigation.navigate('Deck', {
      folderID: route.params.folderID,
      uniqueFolderName: route.params.uniqueFolderName,
      originalFolderName: route.params.originalFolderName,
    });
  };

  const renderItem = ({item, index}: {item: wordObj; index: number}) => {
    return (
      <Card
        index={index}
        term={item.term}
        definition={item.definition}
        id={item.id}
        uniqueDeckName={route.params.uniqueDeckName}
        uniqueFolderName={route.params.uniqueFolderName}
        deleteFunction={() => deleteCard(item.id, item.deckID)}
        updateCard={updateCard}
      />
    );
  };

  const {styles, theme} = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.title}
        value={text}
        onChangeText={txt => onChangeText(txt)}
        placeholder="Deck name"
        placeholderTextColor={theme.utils.hexToRgba(theme.colors.dark, 0.5)}
      />
      <SafeAreaView>
        <FlatList
          numColumns={1}
          data={data}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListFooterComponent={AddCard({data: data, setData: setData})}
        />
      </SafeAreaView>
    </View>
  );
};

const stylesheet = createStyleSheet(theme => ({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: theme.typography.sizes.title,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.dark,
    fontWeight: '400',
    borderBottomWidth: 1.5,
    borderColor: theme.colors.dark,
  },
  list: {
    alignItems: 'center',
    paddingBottom: 300,
  },
}));

export default WordScreen;
