/// <reference types="react" />
import { ListProps } from "./RNList";
/**
 * React implementation of nodegui's [QListWidget](https://docs.nodegui.org/docs/api/generated/classes/qlistwidget/)
 * @example
 * ```javascriptreact
 * return (
 *    <List>
        <ListItem text="NodeGui is great" />
        <ListItem text="This item has a child">
          <View>
            <Text>Hello World</Text>
          </View>
        </ListItem>
      </List>
 * )
 * ```
 */
export declare const List: string | import("react").ComponentType<ListProps>;
