# markdown-it-task-lists-ts

A TypeScript-first markdown-it plugin that converts GitHub-style task lists to HTML checkboxes. Built with type safety and customization in mind.

## Features

- Full TypeScript support with comprehensive type definitions
- Customizable CSS classes for all elements
- Support for nested task lists
- Configurable checkbox behavior (enabled/disabled)
- Accessible HTML output with proper labeling
- Zero dependencies (except for markdown-it peer dependency)

## Installation

```bash
npm install markdown-it-task-lists-ts
# or
yarn add markdown-it-task-lists-ts
```

## Usage

```typescript
import MarkdownIt from 'markdown-it';
import taskLists, { type TaskListOptions } from 'markdown-it-task-lists-ts';

const md = new MarkdownIt();

// Basic usage with default options
md.use(taskLists);

// Usage with custom options
md.use(taskLists, {
  enabled: true,           // Enable checkbox interaction
  label: true,            // Wrap checkboxes in labels
  labelAfter: false,      // Place label before checkbox
  listClass: 'todo-list', // Custom class for ul elements
  itemClass: 'todo-item', // Custom class for li elements
  checkboxClass: 'todo-checkbox', // Custom class for input elements
  labelClass: 'todo-label',        // Custom class for label elements
  tiptapCompatible: true // Output HTML compatible with Tiptap's task list extension
});

// Convert markdown to HTML
const markdown = `
- [ ] Unchecked task
- [x] Checked task
  - [ ] Nested task
`;

const html = md.render(markdown);
```

## Output HTML

The plugin generates semantic HTML with proper ARIA attributes and customizable classes:

```html
<ul class="contains-task-list">
  <li class="task-list-item">
    <label class="task-list-item-label" for="task-item-1">
      <input class="task-list-item-checkbox" type="checkbox" id="task-item-1">
      Unchecked task
    </label>
  </li>
  <li class="task-list-item">
    <label class="task-list-item-label" for="task-item-2">
      <input class="task-list-item-checkbox" type="checkbox" checked id="task-item-2">
      Checked task
    </label>
    <ul class="contains-task-list">
      <li class="task-list-item">
        <label class="task-list-item-label" for="task-item-3">
          <input class="task-list-item-checkbox" type="checkbox" id="task-item-3">
          Nested task
        </label>
      </li>
    </ul>
  </li>
</ul>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | false | When true, checkboxes are interactive. When false, they have the disabled attribute. |
| label | boolean | true | When true, wraps checkboxes in label elements for better accessibility and UX. |
| labelAfter | boolean | false | When true, places the label after the checkbox instead of before. |
| listClass | string | 'contains-task-list' | CSS class for the ul element containing task items. |
| itemClass | string | 'task-list-item' | CSS class for the li elements containing tasks. |
| checkboxClass | string | 'task-list-item-checkbox' | CSS class for the checkbox input elements. |
| labelClass | string | 'task-list-item-label' | CSS class for the label elements (when label option is true). |
| tiptapCompatible | boolean | false | Whether to output HTML compatible with Tiptap's task list extension |

### Tiptap Compatibility

When `tiptapCompatible` is set to `true`, the plugin will output HTML that is compatible with Tiptap's task list extension:

```html
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">Unchecked task</li>
  <li data-type="taskItem" data-checked="true">Checked task</li>
</ul>
```

This is useful when using the plugin with Tiptap's `TaskList` and `TaskItem` extensions.

Example:
```typescript
import MarkdownIt from 'markdown-it';
import taskLists, { type TaskListOptions } from 'markdown-it-task-lists-ts';

const md = new MarkdownIt();
md.use(taskLists, {
  enabled: true,
  label: true,
  tiptapCompatible: true
});
```

## Styling

The plugin provides default classes that you can style, or you can specify your own classes through the options:

```css
/* Default styling */
.contains-task-list {
  list-style-type: none;
  padding-left: 0;
}

.task-list-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-list-item-checkbox {
  margin: 0;
}

.task-list-item-label {
  cursor: pointer;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
