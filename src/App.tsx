/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';

import { UserWarning } from './UserWarning';

import * as todoServices from './api/todos';

import { ErrorMessage } from './types/ErrorMessage';
import { Todo } from './types/Todo';
import { FilterBy } from './types/FilterBy';

import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { Error as ErrorCard } from './components/Error';

const deleteArrOfTodos = async (arr: Todo[]) => {
  const deletion = await Promise.allSettled(
    arr.map(todo => todoServices.deleteTodo(todo.id)),
  );

  return deletion;
};

export const App: React.FC = () => {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [filterBy, setFilterBy] = useState<FilterBy>('all');

  const [deletingCompleteTodos, setDeletingCompleteTodos] = useState(false);

  const [errorMessage, setErrorMessage] = useState<ErrorMessage>('');

  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();

    todoServices
      .getTodos()
      .then(todos => setTodoList(todos))
      .catch(() => {
        setErrorMessage('Unable to load todos');
        setTimeout(() => setErrorMessage(''), 3000);
      })
      .finally();
  }, []);

  const currentTodoList: Todo[] = todoList.filter(item => {
    return (
      filterBy === 'all' ||
      (filterBy === 'active' && item.completed === false) ||
      (filterBy === 'completed' && item.completed === true)
    );
  });

  const handleDeleteTodo = (id: number, callback: CallableFunction) => {
    callback(true);
    todoServices
      .deleteTodo(id)
      .then(() => setTodoList(todoList.filter(todo => todo.id !== id)))
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
        setTimeout(() => setErrorMessage(''), 3000);
      })
      .finally(() => {
        callback(false);
        focusInput();
      });
  };

  const handleDeleteAllCompletedTodos = async () => {
    setDeletingCompleteTodos(true);

    deleteArrOfTodos(todoList.filter(todo => todo.completed))
      .then(res => {
        const rejectedTodos = res
          .map((result, index) =>
            result.status === 'rejected'
              ? todoList.filter(todo => todo.completed)[index]
              : null,
          )
          .filter(todo => todo !== null);

        setTodoList(
          todoList.filter(
            todo => !todo.completed || rejectedTodos.includes(todo),
          ),
        );

        if (rejectedTodos.length > 0) {
          throw new Error('Some todos were not deleted');
        }
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
        setTimeout(() => setErrorMessage(''), 3000);
      })
      .finally(() => {
        setDeletingCompleteTodos(false);
        focusInput();
      });
  };

  if (!todoServices.USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header inputRef={inputRef} />

        <TodoList
          todos={currentTodoList}
          handleDeleteTodo={handleDeleteTodo}
          deletingCompleteTodos={deletingCompleteTodos}
        />

        {/* Hide the footer if there are no todos */}
        {todoList.length > 0 && (
          <Footer
            todos={todoList}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            deleteCompletedTodos={handleDeleteAllCompletedTodos}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <ErrorCard
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
