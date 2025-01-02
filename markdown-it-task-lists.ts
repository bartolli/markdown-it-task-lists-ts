/**
 * @fileoverview A markdown-it plugin that converts GitHub-style task lists to HTML checkboxes.
 * Supports custom styling, nested lists, and configurable checkbox behavior.
 * 
 * @example
 * ```typescript
 * import MarkdownIt from 'markdown-it';
 * import { taskLists } from 'markdown-it-task-lists';
 * 
 * const md = new MarkdownIt();
 * md.use(taskLists, {
 *   enabled: true,
 *   label: true,
 *   labelClass: 'custom-label'
 * });
 * ```
 * 
 * @license MIT
 * @author TypeDown Team
 */

import MarkdownIt from 'markdown-it';
import type { Token } from 'markdown-it';

/**
 * Configuration options for the task lists plugin
 * 
 * @interface TaskListOptions
 */
export interface TaskListOptions {
    /**
     * Whether checkboxes are enabled and interactive
     * When false, checkboxes will be rendered with the disabled attribute
     * @default false
     */
    enabled?: boolean;

    /**
     * Whether to wrap checkboxes in a label element
     * Improves accessibility and click target size
     * @default true
     */
    label?: boolean;

    /**
     * Whether to place the label after the checkbox
     * @default false
     */
    labelAfter?: boolean;

    /**
     * Custom class name for the task list container (ul element)
     * @default 'contains-task-list'
     */
    listClass?: string;

    /**
     * Custom class name for task list items (li element)
     * @default 'task-list-item'
     */
    itemClass?: string;

    /**
     * Custom class name for the checkbox input element
     * @default 'task-list-item-checkbox'
     */
    checkboxClass?: string;

    /**
     * Custom class name for the label element (when label option is true)
     * @default 'task-list-item-label'
     */
    labelClass?: string;
}

/**
 * Extended token type for task list items
 * 
 * @interface TaskListToken
 */
export interface TaskListToken extends Token {
    /**
     * The content of the token
     */
    content: string;

    /**
     * Child tokens of the current token
     */
    children: (TaskListToken | Token)[] | null;

    /**
     * Get the index of an attribute by name
     * @param name The attribute name
     * @returns The index of the attribute, or -1 if not found
     */
    attrIndex(name: string): number;

    /**
     * Add an attribute to the token
     * @param attr The attribute to add
     */
    attrPush(attr: [string, string]): void;

    /**
     * Get the attributes of the token
     */
    attrs: [string, string][];
}

// Disable checkboxes by default
let disableCheckboxes = true;
// Use label wrapper by default
let useLabelWrapper = true;
// Place label after checkbox by default
let useLabelAfter = false;

// Default class names
const defaultClasses = {
    list: 'contains-task-list',
    item: 'task-list-item',
    checkbox: 'task-list-item-checkbox',
    label: 'task-list-item-label'
};

/**
 * Check if a string starts with a todo markdown pattern
 * @param str The string to check
 * @returns Whether the string starts with a todo markdown pattern
 */
const startsWithTodoMarkdown = (str: string): boolean => {
    // Leading whitespace in a list item is already trimmed off by markdown-it
    return str.indexOf('[ ] ') === 0 || str.indexOf('[x] ') === 0 || str.indexOf('[X] ') === 0;
};

/**
 * Check if a token is a list item
 * @param token The token to check
 * @returns Whether the token is a list item
 */
const isListItem = (token: Token): boolean => {
    return token.type === 'list_item_open';
};

/**
 * Check if a token is a paragraph
 * @param token The token to check
 * @returns Whether the token is a paragraph
 */
const isParagraph = (token: Token): boolean => {
    return token.type === 'paragraph_open';
};

/**
 * Check if a token is an inline token
 * @param token The token to check
 * @returns Whether the token is an inline token
 */
const isInline = (token: Token): boolean => {
    return token.type === 'inline';
};

/**
 * Check if a token has an open or close tag
 * @param token The token to check
 * @param tag The tag to check for
 * @returns Whether the token has an open or close tag
 */
const hasOpenOrCloseTag = (token: Token, tag: string): boolean => {
    return token.tag === tag && (token.type === 'paragraph_open' || token.type === 'paragraph_close');
};

/**
 * Markdown-it plugin for task lists
 * @param md The markdown-it instance
 * @param options The plugin options
 */
export function taskLists(md: MarkdownIt, options?: TaskListOptions): void {
    if (options) {
        disableCheckboxes = !options.enabled;
        useLabelWrapper = !!options.label;
        useLabelAfter = !!options.labelAfter;
    }

    const classes = {
        list: options?.listClass ?? defaultClasses.list,
        item: options?.itemClass ?? defaultClasses.item,
        checkbox: options?.checkboxClass ?? defaultClasses.checkbox,
        label: options?.labelClass ?? defaultClasses.label
    };

    // Add the checkbox replacing function to the renderer
    md.core.ruler.after('inline', 'github-task-lists', (state) => {
        const tokens = state.tokens;
        let insideList = false;

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'bullet_list_open') {
                insideList = true;
                continue;
            }
            if (tokens[i].type === 'bullet_list_close') {
                insideList = false;
                continue;
            }
            if (!insideList) continue;

            if (!isListItem(tokens[i])) continue;

            // Find the content token within this list item
            for (let j = i + 1; j < tokens.length; j++) {
                if (tokens[j].type === 'list_item_close') break;
                
                if (!isParagraph(tokens[j])) continue;
                
                // Find the content within the paragraph
                for (let k = j + 1; k < tokens.length; k++) {
                    if (hasOpenOrCloseTag(tokens[k], 'p')) break;
                    
                    if (!isInline(tokens[k])) continue;
                    
                    if (!startsWithTodoMarkdown(tokens[k].content)) continue;

                    // Transform the token
                    const token = tokens[k] as TaskListToken;
                    const checked = token.content.indexOf('[x]') === 0 || token.content.indexOf('[X]') === 0;
                    
                    if (token.children && token.children.length > 0) {
                        token.children[0].content = token.children[0].content.slice(3);
                        
                        const checkbox = new state.Token('html_inline', '', 0);
                        const disabledAttr = disableCheckboxes ? ' disabled ' : '';
                        
                        if (useLabelWrapper) {
                            const id = `task-item-${Math.ceil(Math.random() * (10000 * 1000) - 1000)}`;
                            const label = `<label class="${classes.label}" for="${id}">`;
                            const closeLabel = '</label>';
                            
                            checkbox.content = useLabelAfter
                                ? `<input class="${classes.checkbox}" ${disabledAttr} type="checkbox" ${checked ? 'checked="" ' : ''} id="${id}">${label}${closeLabel}`
                                : `${label}<input class="${classes.checkbox}" ${disabledAttr} type="checkbox" ${checked ? 'checked="" ' : ''} id="${id}">${closeLabel}`;
                        } else {
                            checkbox.content = `<input class="${classes.checkbox}" ${disabledAttr} type="checkbox" ${checked ? 'checked="" ' : ''}>`;
                        }
                        
                        token.children.unshift(checkbox);
                        token.content = token.content.slice(3);
                        
                        // Add CSS classes to the list item
                        let itemClass = classes.item;
                        let parentClass = classes.list;
                        
                        // Find the nearest list item token
                        let current = k;
                        while (current >= 0 && tokens[current].type !== 'list_item_open') {
                            current--;
                        }
                        if (current >= 0) {
                            tokens[current].attrJoin('class', itemClass);
                        }
                        
                        // Find the nearest list token
                        while (current >= 0 && tokens[current].type !== 'bullet_list_open') {
                            current--;
                        }
                        if (current >= 0) {
                            tokens[current].attrJoin('class', parentClass);
                        }
                    }
                }
            }
        }
        return true;
    });
}

export default taskLists;