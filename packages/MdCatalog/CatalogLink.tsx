import { defineComponent, PropType, ExtractPropTypes } from 'vue';
import { LooseRequired } from '@vue/shared';
import { MdHeadingId } from '~/type';
import { prefix } from '~/config';
import { TocItem } from './MdCatalog';

const props = {
  tocItem: {
    type: Object as PropType<TocItem>,
    default: () => ({})
  },
  mdHeadingId: {
    type: Function as PropType<MdHeadingId>,
    default: () => {}
  },
  scrollElement: {
    type: [String, Object] as PropType<string | Element>,
    default: ''
  },
  onClick: {
    type: Function as PropType<(e: MouseEvent, t: TocItem) => void>,
    default: () => {}
  },
  scrollElementOffsetTop: {
    type: Number as PropType<number>,
    default: 0
  },
  isPreview: {
    type: Boolean,
    default: false
  }
};

export type CatalogLinkProps = Readonly<
  LooseRequired<Readonly<ExtractPropTypes<typeof props>>>
>;

const CatalogLink = defineComponent({
  props,
  setup(props: CatalogLinkProps) {
    return () => {
      const { tocItem, mdHeadingId, scrollElement, onClick, scrollElementOffsetTop } =
        props;

      return (
        <div
          class={[`${prefix}-catalog-link`, tocItem.active && `${prefix}-catalog-active`]}
          onClick={(e) => {
            onClick(e, tocItem);
            e.stopPropagation();
            const id = mdHeadingId(tocItem.text, tocItem.level, tocItem.index);
            const targetHeadEle = document.getElementById(id);
            const scrollContainer =
              scrollElement instanceof Element
                ? scrollElement
                : document.querySelector(scrollElement);

            if (targetHeadEle && scrollContainer) {
              let par = targetHeadEle.offsetParent as HTMLElement;
              let offsetTop = targetHeadEle.offsetTop;

              // 滚动容器包含父级offser标准元素
              if (scrollContainer.contains(par)) {
                while (par && scrollContainer != par) {
                  // 循环获取当前对象与相对的top高度
                  offsetTop += par?.offsetTop;
                  par = par?.offsetParent as HTMLElement;
                }
              }

              if (props.isPreview) {
                window?.scrollTo({
                  top: offsetTop - scrollElementOffsetTop,
                  behavior: 'smooth'
                });
              } else {
                scrollContainer?.scrollTo({
                  top: offsetTop - scrollElementOffsetTop,
                  behavior: 'smooth'
                });
              }
            }
          }}
        >
          <span title={tocItem.text}>{tocItem.text}</span>
          <div class={`${prefix}-catalog-wrapper`}>
            {tocItem.children &&
              tocItem.children.map((item) => (
                <CatalogLink
                  mdHeadingId={mdHeadingId}
                  key={`${tocItem.text}-link-${item.level}-${item.text}`}
                  tocItem={item}
                  scrollElement={scrollElement}
                  onClick={onClick}
                  scrollElementOffsetTop={scrollElementOffsetTop}
                />
              ))}
          </div>
        </div>
      );
    };
  }
});

export default CatalogLink;
