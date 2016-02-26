__author__ = 'laura edel'

import nltk
from nltk.corpus import wordnet as wn
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from nltk.tokenize import RegexpTokenizer


def is_noun(tag):
    return tag in ['NN', 'NNS', 'NNP', 'NNPS']

def is_verb(tag):
    return tag in ['VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ']

def is_adverb(tag):
    return tag in ['RB', 'RBR', 'RBS']


def is_adjective(tag):
    return tag in ['JJ', 'JJR', 'JJS']

def penn_to_wn(tag):
    if is_adjective(tag):
        return wn.ADJ
    elif is_noun(tag):
        return wn.NOUN
    elif is_adverb(tag):
        return wn.ADV
    elif is_verb(tag):
        return wn.VERB
    return wn.NOUN

def removeStopWords(text):
    
    print([i for i in text.split() if i not in stop])

def lemmatize(text):
    #use english stopword list
    stop_words = stopwords.words('english')
    #init RegexpTokenizer, that removes punctuation
    tokenizer = RegexpTokenizer(r'\w+')
    #add word from text to list, if it is not part of the stop word list
    for token in text:
        list_of_words = [i.lower() for i in tokenizer.tokenize(text) if i.lower() not in stop_words]
    #get part-of-speech
    pos = nltk.pos_tag(list_of_words)
    #get lemma for each pos tagged word
    lemmata = [nltk.stem.WordNetLemmatizer().lemmatize(item[0],pos=penn_to_wn(item[1])) for item in pos]
    lemmaString = ', '.join(lemmata)
    return lemmaString

#lemmatize("Now he goes to the university of Regensburg.")