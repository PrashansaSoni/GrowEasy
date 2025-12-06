import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/config';

export default function DashboardScreen({ navigation, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { incompleteTodos, completedTodos } = useMemo(() => {
    const incomplete = todos.filter(todo => !todo.completed);
    const completed = todos.filter(todo => todo.completed);
    return { incompleteTodos: incomplete, completedTodos: completed };
  }, [todos]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Fetch todos error:', error.response?.data || error.message);
      Alert.alert(
        'Error', 
        error.response?.data?.detail || error.message || 'Failed to fetch todos'
      );
    }
  };

  const createTodo = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setLoading(true);
    try {
      await api.post('/todos', { title, description });
      setTitle('');
      setDescription('');
      setShowModal(false);
      fetchTodos();
    } catch (error) {
      console.error('Create todo error:', error.response?.data || error.message);
      Alert.alert(
        'Error', 
        error.response?.data?.detail || error.message || 'Failed to create todo'
      );
    }
    setLoading(false);
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await api.put(`/todos/${id}`, { completed: !completed });
      fetchTodos();
    } catch (error) {
      console.error('Toggle todo error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired', 
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => handleLogout()
            }
          ]
        );
        return;
      }
      
      Alert.alert(
        'Error', 
        error.response?.data?.detail || error.message || 'Failed to update todo'
      );
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      fetchTodos();
    } catch (error) {
      console.error('Delete todo error:', error.response?.data || error.message);
      Alert.alert(
        'Error', 
        error.response?.data?.detail || error.message || 'Failed to delete todo'
      );
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    if (onLogout) {
      onLogout();
    } else {
      navigation.replace('Login');
    }
  };

  const renderTodoItem = (item) => (
    <View style={styles.todoItem}>
      <TouchableOpacity 
        style={styles.todoContent}
        onPress={() => toggleTodo(item.id, item.completed)}
      >
        <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.todoText}>
          <Text style={[styles.todoTitle, item.completed && styles.completedText]}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.todoDescription}>{item.description}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTodo(item.id)}>
        <Text style={styles.deleteButton}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Todos</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileButton}>Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Todos</Text>
            <Text style={styles.sectionCount}>({incompleteTodos.length})</Text>
          </View>
          {incompleteTodos.length > 0 ? (
            incompleteTodos.map((item) => (
              <View key={item.id.toString()}>
                {renderTodoItem(item)}
              </View>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No active todos. Great job!</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Completed Todos</Text>
            <Text style={styles.sectionCount}>({completedTodos.length})</Text>
          </View>
          {completedTodos.length > 0 ? (
            completedTodos.map((item) => (
              <View key={item.id.toString()}>
                {renderTodoItem(item)}
              </View>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No completed todos yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.addButtonText}>+ Add Todo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Todo</Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={createTodo}
                disabled={loading}
              >
                <Text style={styles.createButtonText}>
                  {loading ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  profileButton: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  todoItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 18,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: '#6366F1',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxCompleted: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoText: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 17,
    color: '#1A1A1A',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
    fontWeight: '400',
  },
  todoDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 20,
  },
  deleteButton: {
    color: '#EF4444',
    fontSize: 14,
    paddingLeft: 12,
    fontWeight: '600',
  },
  emptySection: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#6366F1',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    color: '#1A1A1A',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

