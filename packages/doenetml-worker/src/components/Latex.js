import TextComponent from "./Text";

export default class Latex extends TextComponent {
    static componentType = "latex";
    static rendererType = "text";

    static createAttributesObject() {
        let attributes = super.createAttributesObject();

        attributes.isLatex.defaultValue = true;

        return attributes;
    }

    static returnChildGroups() {
        let childGroups = super.returnChildGroups();

        childGroups[0].componentTypes.push("math", "m", "md");

        return childGroups;
    }

    static returnStateVariableDefinitions() {
        let stateVariableDefinitions = super.returnStateVariableDefinitions();

        stateVariableDefinitions.value.returnDependencies = () => ({
            mathTextLikeChildren: {
                dependencyType: "child",
                childGroups: ["textLike"],
                variableNames: ["text", "latex"],
            },
        });

        stateVariableDefinitions.value.definition = function ({
            dependencyValues,
        }) {
            if (dependencyValues.mathTextLikeChildren.length === 0) {
                return {
                    useEssentialOrDefaultValue: {
                        value: true,
                    },
                };
            }

            let pieces = [];
            for (let comp of dependencyValues.mathTextLikeChildren) {
                if (typeof comp === "string") {
                    let comptrim = comp.trim();
                    if (comptrim) {
                        pieces.push(comptrim);
                    }
                } else if (comp.stateValues.latex !== undefined) {
                    let latex = comp.stateValues.latex.trim();
                    if (latex) {
                        pieces.push(latex);
                    }
                } else {
                    let text = comp.stateValues.text.trim();
                    if (text) {
                        pieces.push(text);
                    }
                }
            }
            let value = pieces.join(" ");
            return { setValue: { value } };
        };

        stateVariableDefinitions.value.inverseDefinition = function ({
            desiredStateVariableValues,
            dependencyValues,
        }) {
            let numChildren = dependencyValues.mathTextLikeChildren.length;
            if (numChildren > 1) {
                return { success: false };
            }
            if (numChildren === 1) {
                return {
                    success: true,
                    instructions: [
                        {
                            setDependency: "textLikeChildren",
                            desiredValue: desiredStateVariableValues.value,
                            childIndex: 0,
                            variableIndex:
                                dependencyValues.textLikeChildren[0].stateValues
                                    ?.latex === undefined
                                    ? 0
                                    : 1,
                        },
                    ],
                };
            }
            // no children, so set essential value to the desired value
            return {
                success: true,
                instructions: [
                    {
                        setEssentialValue: "value",
                        value:
                            desiredStateVariableValues.value === null
                                ? ""
                                : String(desiredStateVariableValues.value),
                    },
                ],
            };
        };

        stateVariableDefinitions.latex = {
            isAlias: true,
            targetVariableName: "value",
        };

        return stateVariableDefinitions;
    }
}
