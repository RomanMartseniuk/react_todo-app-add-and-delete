/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { Todo } from '../../types/Todo';
import { TodoCard } from '../TodoCard/TodoCard';

type Props = {
  todos: Todo[];
  handleDeleteTodo: (id: number, callback: CallableFunction) => void;
  deletingCompleteTodos: boolean;
};

export const TodoList: React.FC<Props> = ({
  todos,
  handleDeleteTodo,
  deletingCompleteTodos,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => {
        return (
          <TodoCard
            key={todo.id}
            todo={todo}
            handleDeleteTodo={handleDeleteTodo}
            deleting={deletingCompleteTodos && todo.completed}
          />
        );
      })}
    </section>
  );
};
