import me from "math-expressions";
import { cesc, cesc2 } from "@doenet/utils";

function nInDOM(n) {
    if (n < 0) {
        return `−${Math.abs(n)}`;
    } else {
        return String(n);
    }
}

async function testPolygonCopiedTwice({
    vertices,
    polygonName = "/pg",
    graph1Name = "/g1",
    graph2Name = "/g2",
    graph3Name = "/g3",
    pointsInDomPrefix = "/p",
}) {
    for (let i in vertices) {
        let ind = Number(i) + 1;
        if (Number.isFinite(vertices[i][0])) {
            cy.get(`#${cesc2(pointsInDomPrefix + ind)} .mjx-mrow`).should(
                "contain.text",
                `(${nInDOM(
                    Math.round(vertices[i][0] * 100000000) / 100000000,
                ).substring(0, 6)}`,
            );
        }
        if (Number.isFinite(vertices[i][1])) {
            cy.get(`#${cesc2(pointsInDomPrefix + ind)} .mjx-mrow`).should(
                "contain.text",
                `,${nInDOM(
                    Math.round(vertices[i][1] * 100000000) / 100000000,
                ).substring(0, 6)}`,
            );
        }
    }
    cy.get(`#${cesc2(pointsInDomPrefix + (vertices.length + 1))}`).should(
        "not.exist",
    );

    cy.window().then(async (win) => {
        let stateVariables = await win.returnAllStateVariables1();
        expect(
            stateVariables[graph1Name + polygonName].stateValues.numVertices,
        ).eqls(vertices.length);
        expect(
            stateVariables[graph2Name + polygonName].stateValues.numVertices,
        ).eqls(vertices.length);
        expect(
            stateVariables[graph3Name + polygonName].stateValues.numVertices,
        ).eqls(vertices.length);

        for (let i in vertices) {
            if (Number.isFinite(vertices[i][0])) {
                expect(
                    me
                        .fromAst(
                            stateVariables[graph1Name + polygonName].stateValues
                                .vertices[i][0],
                        )
                        .evaluate_to_constant(),
                ).closeTo(vertices[i][0], 1e-12);
                expect(
                    me
                        .fromAst(
                            stateVariables[graph2Name + polygonName].stateValues
                                .vertices[i][0],
                        )
                        .evaluate_to_constant(),
                ).closeTo(vertices[i][0], 1e-12);
                expect(
                    me
                        .fromAst(
                            stateVariables[graph3Name + polygonName].stateValues
                                .vertices[i][0],
                        )
                        .evaluate_to_constant(),
                ).closeTo(vertices[i][0], 1e-12);
            } else {
                expect(
                    stateVariables[graph1Name + polygonName].stateValues
                        .vertices[i][0],
                ).eq(vertices[i][0]);
                expect(
                    stateVariables[graph2Name + polygonName].stateValues
                        .vertices[i][0],
                ).eq(vertices[i][0]);
                expect(
                    stateVariables[graph3Name + polygonName].stateValues
                        .vertices[i][0],
                ).eq(vertices[i][0]);
            }
            if (Number.isFinite(vertices[i][1])) {
                expect(
                    me
                        .fromAst(
                            stateVariables[graph1Name + polygonName].stateValues
                                .vertices[i][1],
                        )
                        .evaluate_to_constant(),
                ).closeTo(vertices[i][1], 1e-12);
                expect(
                    me
                        .fromAst(
                            stateVariables[graph2Name + polygonName].stateValues
                                .vertices[i][1],
                        )
                        .evaluate_to_constant(),
                ).closeTo(vertices[i][1], 1e-12);
                expect(
                    me
                        .fromAst(
                            stateVariables[graph3Name + polygonName].stateValues
                                .vertices[i][1],
                        )
                        .evaluate_to_constant(),
                ).closeTo(vertices[i][1], 1e-12);
            } else {
                expect(
                    stateVariables[graph1Name + polygonName].stateValues
                        .vertices[i][1],
                ).eq(vertices[i][1]);
                expect(
                    stateVariables[graph2Name + polygonName].stateValues
                        .vertices[i][1],
                ).eq(vertices[i][1]);
                expect(
                    stateVariables[graph3Name + polygonName].stateValues
                        .vertices[i][1],
                ).eq(vertices[i][1]);
            }
        }
    });
}

describe("Polygon Tag Tests", function () {
    beforeEach(() => {
        cy.clearIndexedDB();
        cy.visit("/");
    });

    it("Polygon vertices and copied points", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,5)</point>
    <point>(-4,-1)</point>
    <point>(5,2)</point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 5],
            [-4, -1],
            [5, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex");
        cy.window().then(async (win) => {
            vertices[1] = [4, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: vertices[1] },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move double copied individual vertex");
        cy.window().then(async (win) => {
            vertices[2] = [-9, -8];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: { 2: vertices[2] },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Polygon string points in vertices", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <math>-1</math>
  <graph name="g1" newNamespace>
    <polygon vertices="(3,5) (-4,$(../_math1)) (5,2) (-3,4)" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 5],
            [-4, -1],
            [5, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex");
        cy.window().then(async (win) => {
            vertices[1] = [4, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: vertices[1] },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move double copied individual vertex");
        cy.window().then(async (win) => {
            vertices[2] = [-9, -8];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: { 2: vertices[2] },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("dynamic polygon with vertices from copied map, initially zero, copied", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>

  <mathinput name="length" prefill="0" />
  <graph name="g1" newNamespace>
    <map>
      <template><point>($x, 5sin($x))</point></template>
      <sources alias="x"><sequence from="0" length="$(../length)" /></sources>
    </map>
    <polygon vertices="$_map1" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
  </graph>
  $g2{name="g3"}
  <map assignNames="(p1) (p2) (p3) (p4) (p5) (p6) (p7) (p8) (p9) (p10)" >
    <template><round numDecimals="8">$v</round></template>
    <sources alias="v">$(g1/pg.vertices)</sources>
  </map>
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [];
        testPolygonCopiedTwice({ vertices });

        cy.get(cesc("#\\/length") + " textarea")
            .type("{end}{backspace}1{enter}", { force: true })
            .then(() => {
                vertices[0] = [0, 5 * Math.sin(0)];
                testPolygonCopiedTwice({ vertices });
            });

        cy.get(cesc("#\\/length") + " textarea")
            .type("{end}{backspace}2{enter}", { force: true })
            .then(() => {
                vertices[1] = [1, 5 * Math.sin(1)];
                testPolygonCopiedTwice({ vertices });
            });

        cy.get(cesc("#\\/length") + " textarea")
            .type("{end}{backspace}3{enter}", { force: true })
            .then(() => {
                vertices[2] = [2, 5 * Math.sin(2)];
                testPolygonCopiedTwice({ vertices });
            });

        cy.get(cesc("#\\/length") + " textarea")
            .type("{end}{backspace}2{enter}", { force: true })
            .then(() => {
                vertices.splice(2, 1);
                testPolygonCopiedTwice({ vertices });
            });

        cy.get(cesc("#\\/length") + " textarea")
            .type("{end}{backspace}0{enter}", { force: true })
            .then(() => {
                vertices = [];
                testPolygonCopiedTwice({ vertices });
            });

        cy.get(cesc("#\\/length") + " textarea")
            .type("{end}{backspace}5{enter}", { force: true })
            .then(() => {
                for (let i = 0; i < 5; i++) {
                    vertices.push([i, 5 * Math.sin(i)]);
                }
                testPolygonCopiedTwice({ vertices });
            });

        cy.log("start over and begin with big increment");
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>b</text>

  <mathinput name="length" prefill="0" />
  <graph name="g1" newNamespace>
    <map>
      <template><point>($x, 5sin($x))</point></template>
      <sources alias="x"><sequence from="0" length="$(../length)" /></sources>
    </map>
    <polygon vertices="$_map1" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
  </graph>
  $g2{name="g3"}
  <map assignNames="(p1) (p2) (p3) (p4) (p5) (p6) (p7) (p8) (p9) (p10)" >
    <template><round numDecimals="8">$v</round></template>
    <sources alias="v">$(g1/pg.vertices)</sources>
  </map>
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "b"); //wait for page to load

        cy.window().then(async (win) => {
            vertices = [];
            testPolygonCopiedTwice({ vertices });
        });

        cy.get(cesc("#\\/length") + " textarea")
            .type("{end}{backspace}10{enter}", { force: true })
            .then(() => {
                for (let i = 0; i < 10; i++) {
                    vertices.push([i, 5 * Math.sin(i)]);
                }
                testPolygonCopiedTwice({ vertices });
            });

        cy.get(cesc("#\\/length") + " textarea")
            .type("{end}{backspace}{backspace}1{enter}", { force: true })
            .then(() => {
                vertices = [[0, 5 * Math.sin(0)]];
                testPolygonCopiedTwice({ vertices });
            });
    });

    it("polygon with initially undefined point", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <mathinput/>

  <graph name="g1" newNamespace>
    <polygon vertices="(1,2) (-1,5) ($(../_mathinput1),7) (3,-5) (-4,-3)" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
  </graph>
  $g2{name="g3"}
  <map assignNames="(p1) (p2) (p3) (p4) (p5)" >
    <template><round numDecimals="8">$v</round></template>
    <sources alias="v">$(g1/pg.vertices)</sources>
  </map>
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [1, 2],
            [-1, 5],
            ["\uff3f", 7],
            [3, -5],
            [-4, -3],
        ];
        testPolygonCopiedTwice({ vertices });

        cy.get(cesc("#\\/_mathinput1") + " textarea")
            .type("{end}{backspace}-2{enter}", { force: true })
            .then(() => {
                vertices[2][0] = -2;
                testPolygonCopiedTwice({ vertices });
            });
    });

    it(`can't move polygon based on map`, () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  
  <graph name="g1" newNamespace>
    <map hide assignNames="(mp1) (mp2) (mp3) (mp4) (mp5) (mp6) (mp7) (mp8) (mp9) (mp10) (mp11)" >
      <template><point>($x, 5sin($x))</point></template>
      <sources alias="x"><sequence from="-5" to="5"/></sources>
    </map>
    <polygon vertices="$_map1" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
  </graph>
  $g2{name="g3"}
  <map assignNames="(p1) (p2) (p3) (p4) (p5) (p6) (p7) (p8) (p9) (p10) (p11)" >
    <template><round numDecimals="8">$v</round></template>
    <sources alias="v">$(g1/pg.vertices)</sources>
  </map>
  <textinput name="ti" />
  $ti.value{assignNames="t"}
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [];
        for (let i = -5; i <= 5; i++) {
            vertices.push([i, 5 * Math.sin(i)]);
        }
        testPolygonCopiedTwice({ vertices });

        cy.log("can't move points");
        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/mp1",
                args: { x: 9, y: -8 },
            });
            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/mp9",
                args: { x: -8, y: 4 },
            });

            // since core could be delayed and we can't tell that no change occurred,
            // change value of textinput and wait for the change to be processed by core
            cy.get(cesc("#\\/ti_input")).type("wait{enter}");
            cy.get(cesc("#\\/t"))
                .should("have.text", "wait")
                .then(() => {
                    testPolygonCopiedTwice({ vertices });
                });
        });

        cy.log("can't move polygon1");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            let vertices2 = vertices.map((v) => [v[0] + moveX, v[1] + moveY]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: vertices2,
                },
            });

            cy.get(cesc("#\\/ti_input")).clear().type("more{enter}");
            cy.get(cesc("#\\/t"))
                .should("have.text", "more")
                .then(() => {
                    testPolygonCopiedTwice({ vertices });
                });
        });

        cy.log("can't move polygon2");
        cy.window().then(async (win) => {
            let moveX = -5;
            let moveY = 6;

            let vertices2 = vertices.map((v) => [v[0] + moveX, v[1] + moveY]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: vertices2,
                },
            });

            cy.get(cesc("#\\/ti_input")).clear().type("less{enter}");
            cy.get(cesc("#\\/t"))
                .should("have.text", "less")
                .then(() => {
                    testPolygonCopiedTwice({ vertices });
                });
        });

        cy.log("can't move polygon3");
        cy.window().then(async (win) => {
            let moveX = 7;
            let moveY = -4;

            let vertices2 = vertices.map((v) => [v[0] + moveX, v[1] + moveY]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: vertices2,
                },
            });

            cy.get(cesc("#\\/ti_input")).clear().type("last{enter}");
            cy.get(cesc("#\\/t"))
                .should("have.text", "last")
                .then(() => {
                    testPolygonCopiedTwice({ vertices });
                });
        });
    });

    it(`create moveable polygon based on map`, () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>

  <graph name="g1" newNamespace>
    <map hide assignNames="(mp1) (mp2) (mp3) (mp4) (mp5) (mp6) (mp7) (mp8) (mp9) (mp10) (mp11)" >
      <template><point>($x + <math>0</math>, 5sin($x) + <math>0</math>)</point></template>
      <sources alias="x"><sequence from="-5" to="5"/></sources>
    </map>
    <polygon vertices="$_map1" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
  </graph>
  $g2{name="g3"}
  <map assignNames="(p1) (p2) (p3) (p4) (p5) (p6) (p7) (p8) (p9) (p10) (p11)" >
    <template><round numDecimals="8">$v</round></template>
    <sources alias="v">$(g1/pg.vertices)</sources>
  </map>
  <textinput name="ti" />
  $ti.value{assignNames="t"}
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [];
        for (let i = -5; i <= 5; i++) {
            vertices.push([i, 5 * Math.sin(i)]);
        }
        testPolygonCopiedTwice({ vertices });

        cy.log("can move points");

        cy.window().then(async (win) => {
            vertices[0] = [9, -8];
            vertices[8] = [-8, 4];

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/mp1",
                args: { x: vertices[0][0], y: vertices[0][1] },
            });
            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/mp9",
                args: { x: vertices[8][0], y: vertices[8][1] },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("can move polygon1");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] += moveX;
                vertices[i][1] += moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("can move polygon2");
        cy.window().then(async (win) => {
            let moveX = -5;
            let moveY = 6;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] += moveX;
                vertices[i][1] += moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("can move polygon3");
        cy.window().then(async (win) => {
            let moveX = 7;
            let moveY = -4;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] += moveX;
                vertices[i][1] += moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("copy vertices of polygon", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
  <polygon vertices="(-3,-1) (1,2) (3,4) (6,-2)" />
  </graph>
  <graph>
  $_polygon1.vertex1{assignNames="v1"}
  $_polygon1.vertex2{assignNames="v2"}
  $_polygon1.vertex3{assignNames="v3"}
  $_polygon1.vertex4{assignNames="v4"}
  </graph>
  <graph>
  <copy assignNames="v1a v2a v3a v4a" prop="vertices" target="_polygon1" />
  </graph>
  $_polygon1.vertex4{assignNames="v4b"}
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            let ps = [
                [-3, -1],
                [1, 2],
                [3, 4],
                [6, -2],
            ];

            for (let i = 0; i < 4; i++) {
                expect(stateVariables[`/v${i + 1}`].stateValues.xs[0]).eq(
                    ps[i][0],
                );
                expect(stateVariables[`/v${i + 1}a`].stateValues.xs[0]).eq(
                    ps[i][0],
                );
                expect(stateVariables[`/v${i + 1}`].stateValues.xs[1]).eq(
                    ps[i][1],
                );
                expect(stateVariables[`/v${i + 1}a`].stateValues.xs[1]).eq(
                    ps[i][1],
                );
            }

            cy.get(cesc("#\\/v4b") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(ps[3][0])},${nInDOM(ps[3][1])})`,
            );
        });

        cy.log("move individually copied vertices");
        cy.window().then(async (win) => {
            let ps = [
                [-5, 3],
                [-2, 7],
                [0, -8],
                [9, -6],
            ];

            for (let i = 0; i < 4; i++) {
                win.callAction1({
                    actionName: "movePoint",
                    componentName: `/v${i + 1}`,
                    args: { x: ps[i][0], y: ps[i][1] },
                });
            }

            cy.get(cesc("#\\/v4b") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(ps[3][0])},${nInDOM(ps[3][1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                for (let i = 0; i < 4; i++) {
                    expect(stateVariables[`/v${i + 1}`].stateValues.xs[0]).eq(
                        ps[i][0],
                    );
                    expect(stateVariables[`/v${i + 1}a`].stateValues.xs[0]).eq(
                        ps[i][0],
                    );
                    expect(stateVariables[`/v${i + 1}`].stateValues.xs[1]).eq(
                        ps[i][1],
                    );
                    expect(stateVariables[`/v${i + 1}a`].stateValues.xs[1]).eq(
                        ps[i][1],
                    );
                }
            });
        });

        cy.log("move array-copied vertices");
        cy.window().then(async (win) => {
            let ps = [
                [-7, -1],
                [-3, 5],
                [2, 4],
                [6, 0],
            ];

            for (let i = 0; i < 4; i++) {
                win.callAction1({
                    actionName: "movePoint",
                    componentName: `/v${i + 1}a`,
                    args: { x: ps[i][0], y: ps[i][1] },
                });
            }

            cy.get(cesc("#\\/v4b") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(ps[3][0])},${nInDOM(ps[3][1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                for (let i = 0; i < 4; i++) {
                    expect(stateVariables[`/v${i + 1}`].stateValues.xs[0]).eq(
                        ps[i][0],
                    );
                    expect(stateVariables[`/v${i + 1}a`].stateValues.xs[0]).eq(
                        ps[i][0],
                    );
                    expect(stateVariables[`/v${i + 1}`].stateValues.xs[1]).eq(
                        ps[i][1],
                    );
                    expect(stateVariables[`/v${i + 1}a`].stateValues.xs[1]).eq(
                        ps[i][1],
                    );
                }
            });
        });
    });

    it("new polygon from copied vertices of polygon", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
  <polygon vertices="(-9,6) (-3,7) (4,0) (8,5)" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    <polygon vertices="$(../g1/pg.vertices)" name="pg" />
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [-9, 6],
            [-3, 7],
            [4, 0],
            [8, 5],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move first polygon up and to the right");
        cy.window().then(async (win) => {
            let moveX = 4;
            let moveY = 2;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] += moveX;
                vertices[i][1] += moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the left");
        cy.window().then(async (win) => {
            let moveX = -7;
            let moveY = 3;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] += moveX;
                vertices[i][1] += moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move dobule copied polygon down and to the left");
        cy.window().then(async (win) => {
            let moveX = -1;
            let moveY = -4;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] += moveX;
                vertices[i][1] += moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("new polygon as translated version of polygon", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
    <text>a</text>
    <mathinput prefill="5" name="transx" />
    <mathinput prefill="7" name="transy" />
    <graph>
    <polygon vertices=" (0,0) (3,-4) (1,-6) (-5,-6) " />
    <map hide>
      <template newNamespace>
        <point>(<extract prop="x"><copy target="x" fixed="false"/></extract>+
          <copy prop="value" modifyIndirectly="false" target="../transx" />,
        <extract prop="y"><copy target="x" fixed="false" /></extract>+
        <copy prop="value" modifyIndirectly="false" target="../transy" />)
        </point>
      </template>
      <sources alias="x">
        $_polygon1.vertices{name="vs"}
      </sources>
    </map>
    <polygon vertices="$_map1" />
    </graph>
    $_polygon2.vertices{assignNames="p1 p2 p3 p4"}

    `,
                },
                "*",
            );
        });

        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        async function testPolygons({ vertices, transX, transY }) {
            let vertices2 = vertices.map((v) => [v[0] + transX, v[1] + transY]);

            for (let i in vertices) {
                let ind = Number(i) + 1;
                cy.get(`#${cesc2("/p" + ind)} .mjx-mrow`).should(
                    "contain.text",
                    `(${nInDOM(
                        Math.round(vertices2[i][0] * 100000000) / 100000000,
                    ).substring(0, 6)}`,
                );
                cy.get(`#${cesc2("/p" + ind)} .mjx-mrow`).should(
                    "contain.text",
                    `,${nInDOM(
                        Math.round(vertices2[i][1] * 100000000) / 100000000,
                    ).substring(0, 6)}`,
                );
            }
            cy.get(`#${cesc2("/p" + (vertices.length + 1))}`).should(
                "not.exist",
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.numVertices,
                ).eqls(vertices.length);
                expect(
                    stateVariables["/_polygon2"].stateValues.numVertices,
                ).eqls(vertices.length);

                for (let i in vertices) {
                    if (Number.isFinite(vertices[i][0])) {
                        expect(
                            me
                                .fromAst(
                                    stateVariables["/_polygon1"].stateValues
                                        .vertices[i][0],
                                )
                                .evaluate_to_constant(),
                        ).closeTo(vertices[i][0], 1e-12);
                        expect(
                            me
                                .fromAst(
                                    stateVariables["/_polygon2"].stateValues
                                        .vertices[i][0],
                                )
                                .evaluate_to_constant(),
                        ).closeTo(vertices2[i][0], 1e-12);
                    } else {
                        expect(
                            stateVariables["/_polygon1"].stateValues.vertices[
                                i
                            ][0],
                        ).eq(vertices[i][0]);
                        expect(
                            stateVariables["/_polygon2"].stateValues.vertices[
                                i
                            ][0],
                        ).eq(vertices2[i][0]);
                    }
                    if (Number.isFinite(vertices[i][1])) {
                        expect(
                            me
                                .fromAst(
                                    stateVariables["/_polygon1"].stateValues
                                        .vertices[i][1],
                                )
                                .evaluate_to_constant(),
                        ).closeTo(vertices[i][1], 1e-12);
                        expect(
                            me
                                .fromAst(
                                    stateVariables["/_polygon2"].stateValues
                                        .vertices[i][1],
                                )
                                .evaluate_to_constant(),
                        ).closeTo(vertices2[i][1], 1e-12);
                    } else {
                        expect(
                            stateVariables["/_polygon1"].stateValues.vertices[
                                i
                            ][1],
                        ).eq(vertices[i][1]);
                        expect(
                            stateVariables["/_polygon2"].stateValues.vertices[
                                i
                            ][1],
                        ).eq(vertices2[i][1]);
                    }
                }
            });
        }

        let vertices = [
            [0, 0],
            [3, -4],
            [1, -6],
            [-5, -6],
        ];
        let transX = 5;
        let transY = 7;

        testPolygons({ vertices, transX, transY });

        cy.log("move points on first polygon");
        cy.window().then(async (win) => {
            vertices = [
                [1, -1],
                [-3, 2],
                [-1, 7],
                [6, 3],
            ];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: vertices,
                },
            });

            testPolygons({ vertices, transX, transY });
        });

        cy.log("move points on second polygon");
        cy.window().then(async (win) => {
            let vertices2 = [
                [-3, 4],
                [1, 0],
                [9, 6],
                [2, -1],
            ];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon2",
                args: {
                    pointCoords: vertices2,
                },
            });

            vertices = vertices2.map((v) => [v[0] - transX, v[1] - transY]);

            testPolygons({ vertices, transX, transY });
        });

        cy.log("change translation");
        cy.get(cesc("#\\/transx") + " textarea").type(
            "{end}{backspace}2{enter}",
            {
                force: true,
            },
        );
        cy.get(cesc("#\\/transy") + " textarea").type(
            "{end}{backspace}10{enter}",
            {
                force: true,
            },
        );
        cy.window().then(async (win) => {
            transX = 2;
            transY = 10;

            testPolygons({ vertices, transX, transY });
        });
    });

    it("parallelogram based on three points", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
    <text>a</text>
    <graph>
      <polygon name="parallelogram" vertices="(1,2) (3,4) (-5,6) ($(parallelogram.vertexX1_1{fixed})+$(parallelogram.vertexX3_1{fixed})-$(parallelogram.vertexX2_1), $(parallelogram.vertexX1_2{fixed})+$(parallelogram.vertexX3_2{fixed})-$(parallelogram.vertexX2_2))" />
    </graph>

    $parallelogram.vertices{assignNames="p1 p2 p3 p4"}

    `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let A = [1, 2];
        let B = [3, 4];
        let C = [-5, 6];
        let D = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]];
        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(
                stateVariables["/parallelogram"].stateValues.vertices[0],
            ).eqls(A);
            expect(
                stateVariables["/parallelogram"].stateValues.vertices[1],
            ).eqls(B);
            expect(
                stateVariables["/parallelogram"].stateValues.vertices[2],
            ).eqls(C);
            expect(
                stateVariables["/parallelogram"].stateValues.vertices[3],
            ).eqls(D);
        });

        cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(A[0])},${nInDOM(A[1])})`,
        );

        cy.log("move first vertex");
        cy.window().then(async (win) => {
            A = [-4, -1];
            D = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/parallelogram",
                args: {
                    pointCoords: { 0: A },
                },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[3],
                ).eqls(D);
            });
        });

        cy.log("move second vertex");
        cy.window().then(async (win) => {
            B = [8, 9];
            D = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/parallelogram",
                args: {
                    pointCoords: { 1: B },
                },
            });

            cy.get(cesc("#\\/p2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(B[0])},${nInDOM(B[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[3],
                ).eqls(D);
            });
        });

        cy.log("move third vertex");
        cy.window().then(async (win) => {
            C = [-3, 7];
            D = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/parallelogram",
                args: {
                    pointCoords: { 2: C },
                },
            });

            cy.get(cesc("#\\/p3") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(C[0])},${nInDOM(C[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[3],
                ).eqls(D);
            });
        });

        cy.log("move fourth vertex");
        cy.window().then(async (win) => {
            D = [7, 0];
            B = [A[0] + C[0] - D[0], A[1] + C[1] - D[1]];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/parallelogram",
                args: {
                    pointCoords: { 3: D },
                },
            });

            cy.get(cesc("#\\/p4") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(D[0])},${nInDOM(D[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/parallelogram"].stateValues.vertices[3],
                ).eqls(D);
            });
        });
    });

    it("new polygon from copied vertices, some flipped", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
    <polygon vertices="(-9,6) (-3,7) (4,0) (8,5)" />
  </graph>
  <graph>
    <polygon vertices="$(_polygon1.vertex1) ($(_polygon1.vertexX2_2), $(_polygon1.vertexX2_1)) $(_polygon1.vertex3) ($(_polygon1.vertexX4_2), $(_polygon1.vertexX4_1))" />
  </graph>
  $_polygon2.vertices{assignNames="p1 p2 p3 p4"}
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        async function testPolygons({ vertices }) {
            let vertices2 = [...vertices];
            vertices2[1] = [vertices2[1][1], vertices2[1][0]];
            vertices2[3] = [vertices2[3][1], vertices2[3][0]];

            for (let i in vertices) {
                let ind = Number(i) + 1;
                cy.get(`#${cesc2("/p" + ind)} .mjx-mrow`).should(
                    "contain.text",
                    `(${nInDOM(
                        Math.round(vertices2[i][0] * 100000000) / 100000000,
                    ).substring(0, 6)}`,
                );
                cy.get(`#${cesc2("/p" + ind)} .mjx-mrow`).should(
                    "contain.text",
                    `,${nInDOM(
                        Math.round(vertices2[i][1] * 100000000) / 100000000,
                    ).substring(0, 6)}`,
                );
            }
            cy.get(`#${cesc2("/p" + (vertices.length + 1))}`).should(
                "not.exist",
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.numVertices,
                ).eqls(vertices.length);
                expect(
                    stateVariables["/_polygon2"].stateValues.numVertices,
                ).eqls(vertices.length);

                for (let i in vertices) {
                    if (Number.isFinite(vertices[i][0])) {
                        expect(
                            me
                                .fromAst(
                                    stateVariables["/_polygon1"].stateValues
                                        .vertices[i][0],
                                )
                                .evaluate_to_constant(),
                        ).closeTo(vertices[i][0], 1e-12);
                        expect(
                            me
                                .fromAst(
                                    stateVariables["/_polygon2"].stateValues
                                        .vertices[i][0],
                                )
                                .evaluate_to_constant(),
                        ).closeTo(vertices2[i][0], 1e-12);
                    } else {
                        expect(
                            stateVariables["/_polygon1"].stateValues.vertices[
                                i
                            ][0],
                        ).eq(vertices[i][0]);
                        expect(
                            stateVariables["/_polygon2"].stateValues.vertices[
                                i
                            ][0],
                        ).eq(vertices2[i][0]);
                    }
                    if (Number.isFinite(vertices[i][1])) {
                        expect(
                            me
                                .fromAst(
                                    stateVariables["/_polygon1"].stateValues
                                        .vertices[i][1],
                                )
                                .evaluate_to_constant(),
                        ).closeTo(vertices[i][1], 1e-12);
                        expect(
                            me
                                .fromAst(
                                    stateVariables["/_polygon2"].stateValues
                                        .vertices[i][1],
                                )
                                .evaluate_to_constant(),
                        ).closeTo(vertices2[i][1], 1e-12);
                    } else {
                        expect(
                            stateVariables["/_polygon1"].stateValues.vertices[
                                i
                            ][1],
                        ).eq(vertices[i][1]);
                        expect(
                            stateVariables["/_polygon2"].stateValues.vertices[
                                i
                            ][1],
                        ).eq(vertices2[i][1]);
                    }
                }
            });
        }

        let vertices = [
            [-9, 6],
            [-3, 7],
            [4, 0],
            [8, 5],
        ];

        testPolygons({ vertices });

        cy.log("move first polygon verticies");
        cy.window().then(async (win) => {
            vertices = [
                [7, 2],
                [1, -3],
                [2, 9],
                [-4, -3],
            ];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: vertices,
                },
            });

            testPolygons({ vertices });
        });

        cy.log("move second polygon verticies");
        cy.window().then(async (win) => {
            let vertices2 = [
                [-1, 9],
                [5, 7],
                [-8, 1],
                [-7, 6],
            ];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon2",
                args: {
                    pointCoords: vertices2,
                },
            });

            vertices = [...vertices2];
            vertices[1] = [vertices[1][1], vertices[1][0]];
            vertices[3] = [vertices[3][1], vertices[3][0]];

            testPolygons({ vertices });
        });
    });

    it("four vertex polygon based on three points", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
  <polygon vertices="(1,2) (3,4) (-5,6) ($(_polygon1.vertexX3_1{fixed})+$(_polygon1.vertexX2_1{fixed})-$(_polygon1.vertexX1_1), $(_polygon1.vertexX3_2{fixed})+$(_polygon1.vertexX2_2{fixed})-$(_polygon1.vertexX1_2))" />
  </graph>
  $_polygon1.vertices{assignNames="p1 p2 p3 p4"}

  `,
                },
                "*",
            );
        });

        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let A = [1, 2];
        let B = [3, 4];
        let C = [-5, 6];
        let D = [C[0] + B[0] - A[0], C[1] + B[1] - A[1]];

        cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(A[0])},${nInDOM(A[1])})`,
        );

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/_polygon1"].stateValues.vertices[0]).eqls(
                A,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[1]).eqls(
                B,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[2]).eqls(
                C,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[3]).eqls(
                D,
            );
        });

        cy.log("move first vertex");
        cy.window().then(async (win) => {
            A = [-4, -1];
            D = [C[0] + B[0] - A[0], C[1] + B[1] - A[1]];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 0: A },
                },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(D);
            });
        });

        cy.log("move second vertex");
        cy.window().then(async (win) => {
            B = [8, 9];
            D = [C[0] + B[0] - A[0], C[1] + B[1] - A[1]];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 1: B },
                },
            });

            cy.get(cesc("#\\/p2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(B[0])},${nInDOM(B[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(D);
            });
        });

        cy.log("move third vertex");
        cy.window().then(async (win) => {
            C = [-3, 7];
            D = [C[0] + B[0] - A[0], C[1] + B[1] - A[1]];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 2: C },
                },
            });

            cy.get(cesc("#\\/p3") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(C[0])},${nInDOM(C[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(D);
            });
        });

        cy.log("move fourth vertex");
        cy.window().then(async (win) => {
            D = [7, 0];
            A = [C[0] + B[0] - D[0], C[1] + B[1] - D[1]];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 3: D },
                },
            });

            cy.get(cesc("#\\/p4") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(D[0])},${nInDOM(D[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(D);
            });
        });
    });

    it("fourth vertex depends on internal copy of first vertex", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
  <polygon vertices="(1,2) (3,4) (-5,6) $(_polygon1.vertex1{createComponentOfType='point'})" />
  </graph>
  $_polygon1.vertices{assignNames="p1 p2 p3 p4"}
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let A = [1, 2];
        let B = [3, 4];
        let C = [-5, 6];

        cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(A[0])},${nInDOM(A[1])})`,
        );

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/_polygon1"].stateValues.numVertices).eq(4);
            expect(stateVariables["/_polygon1"].stateValues.vertices[0]).eqls(
                A,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[1]).eqls(
                B,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[2]).eqls(
                C,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[3]).eqls(
                A,
            );
        });

        cy.log("move first vertex");
        cy.window().then(async (win) => {
            A = [-4, -1];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 0: A },
                },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
            });
        });

        cy.log("move second vertex");
        cy.window().then(async (win) => {
            B = [8, 9];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 1: B },
                },
            });

            cy.get(cesc("#\\/p2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(B[0])},${nInDOM(B[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
            });
        });

        cy.log("move third vertex");
        cy.window().then(async (win) => {
            C = [-3, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 2: C },
                },
            });

            cy.get(cesc("#\\/p3") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(C[0])},${nInDOM(C[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
            });
        });

        cy.log("move fourth vertex");
        cy.window().then(async (win) => {
            A = [7, 0];
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 3: A },
                },
            });

            cy.get(cesc("#\\/p4") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
            });
        });
    });

    it("first vertex depends on internal copy of fourth vertex", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
  <polygon vertices="$(_polygon1.vertex4{ createComponentOfType='point' }) (3,4) (-5,6) (1,2)" />
  </graph>
  $_polygon1.vertices{assignNames="p1 p2 p3 p4"}
  
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let A = [1, 2];
        let B = [3, 4];
        let C = [-5, 6];

        cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(A[0])},${nInDOM(A[1])})`,
        );

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/_polygon1"].stateValues.numVertices).eq(4);
            expect(stateVariables["/_polygon1"].stateValues.vertices[0]).eqls(
                A,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[1]).eqls(
                B,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[2]).eqls(
                C,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[3]).eqls(
                A,
            );
        });

        cy.log("move first vertex");
        cy.window().then(async (win) => {
            A = [-4, -1];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 0: A },
                },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
            });
        });

        cy.log("move second vertex");
        cy.window().then(async (win) => {
            B = [8, 9];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 1: B },
                },
            });

            cy.get(cesc("#\\/p2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(B[0])},${nInDOM(B[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
            });
        });

        cy.log("move third vertex");
        cy.window().then(async (win) => {
            C = [-3, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 2: C },
                },
            });

            cy.get(cesc("#\\/p3") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(C[0])},${nInDOM(C[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
            });
        });

        cy.log("move fourth vertex");
        cy.window().then(async (win) => {
            A = [7, 0];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 3: A },
                },
            });

            cy.get(cesc("#\\/p4") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
            });
        });
    });

    it("first vertex depends fourth, formula for fifth", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
  <polygon vertices="$(_polygon1.vertex4{createComponentOfType='point'}) (3,4) (-5,6) (1,2) ($(_polygon1.vertexX1_1)+1,2)" />
  </graph>
  $_polygon1.vertices{assignNames="p1 p2 p3 p4 p5"}
  
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let A = [1, 2];
        let B = [3, 4];
        let C = [-5, 6];
        let D = [A[0] + 1, 2];

        cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(A[0])},${nInDOM(A[1])})`,
        );

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/_polygon1"].stateValues.vertices[0]).eqls(
                A,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[1]).eqls(
                B,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[2]).eqls(
                C,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[3]).eqls(
                A,
            );
            expect(stateVariables["/_polygon1"].stateValues.vertices[4]).eqls(
                D,
            );
        });

        cy.log("move first vertex");
        cy.window().then(async (win) => {
            A = [-4, -1];
            D[0] = A[0] + 1;

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 0: A },
                },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[4],
                ).eqls(D);
            });
        });

        cy.log("move second vertex");
        cy.window().then(async (win) => {
            B = [8, 9];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 1: B },
                },
            });

            cy.get(cesc("#\\/p2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(B[0])},${nInDOM(B[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[4],
                ).eqls(D);
            });
        });

        cy.log("move third vertex");
        cy.window().then(async (win) => {
            C = [-3, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 2: C },
                },
            });

            cy.get(cesc("#\\/p3") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(C[0])},${nInDOM(C[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[4],
                ).eqls(D);
            });
        });

        cy.log("move fourth vertex");
        cy.window().then(async (win) => {
            A = [7, 0];
            D[0] = A[0] + 1;

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 3: A },
                },
            });

            cy.get(cesc("#\\/p4") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[4],
                ).eqls(D);
            });
        });

        cy.log("move fifth vertex");
        cy.window().then(async (win) => {
            D = [-5, 9];
            A[0] = D[0] - 1;

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 4: D },
                },
            });

            cy.get(cesc("#\\/p5") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(D[0])},${nInDOM(D[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[0],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[1],
                ).eqls(B);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[2],
                ).eqls(C);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[3],
                ).eqls(A);
                expect(
                    stateVariables["/_polygon1"].stateValues.vertices[4],
                ).eqls(D);
            });
        });
    });

    it("first, fourth, seventh vertex depends on fourth, seventh, tenth", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
  <polygon name="P" vertices="$(P.vertex4{createComponentOfType='point'}) (1,2) (3,4) $(P.vertex7{createComponentOfType='point'}) (5,7) (-5,7) $(P.vertex10{createComponentOfType='point'}) (3,1) (5,0) (-5,-1)" />
  </graph>
  $P.vertices{assignNames="p1 p2 p3 p4 p5 p6 p7 p8 p9 p10"}
  
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let A = [-5, -1];
        let B = [1, 2];
        let C = [3, 4];
        let D = [5, 7];
        let E = [-5, 7];
        let F = [3, 1];
        let G = [5, 0];

        cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(A[0])},${nInDOM(A[1])})`,
        );

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A);
            expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
            expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
            expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A);
            expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
            expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
            expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A);
            expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
            expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
            expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
        });

        cy.log("move first vertex");
        cy.window().then(async (win) => {
            A = [-4, -9];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 0: A },
                },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move second vertex");
        cy.window().then(async (win) => {
            B = [8, 9];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 1: B },
                },
            });

            cy.get(cesc("#\\/p2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(B[0])},${nInDOM(B[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move third vertex");
        cy.window().then(async (win) => {
            C = [-3, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 2: C },
                },
            });

            cy.get(cesc("#\\/p3") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(C[0])},${nInDOM(C[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move fourth vertex");
        cy.window().then(async (win) => {
            A = [7, 0];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 3: A },
                },
            });

            cy.get(cesc("#\\/p4") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move fifth vertex");
        cy.window().then(async (win) => {
            D = [-9, 1];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 4: D },
                },
            });

            cy.get(cesc("#\\/p5") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(D[0])},${nInDOM(D[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move sixth vertex");
        cy.window().then(async (win) => {
            E = [-3, 6];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 5: E },
                },
            });

            cy.get(cesc("#\\/p6") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(E[0])},${nInDOM(E[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move seventh vertex");
        cy.window().then(async (win) => {
            A = [2, -4];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 6: A },
                },
            });

            cy.get(cesc("#\\/p7") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move eighth vertex");
        cy.window().then(async (win) => {
            F = [6, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 7: F },
                },
            });

            cy.get(cesc("#\\/p8") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(F[0])},${nInDOM(F[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move nineth vertex");
        cy.window().then(async (win) => {
            G = [1, -8];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 8: G },
                },
            });

            cy.get(cesc("#\\/p9") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(G[0])},${nInDOM(G[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move tenth vertex");
        cy.window().then(async (win) => {
            A = [-6, 10];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 9: A },
                },
            });

            cy.get(cesc("#\\/p10") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });
    });

    it("first, fourth, seventh vertex depends on shifted fourth, seventh, tenth", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
  <polygon name="P" vertices="($(P.vertexX4_1)+1,$(P.vertexX4_2)+1) (1,2) (3,4) ($(P.vertexX7_1)+1,$(P.vertexX7_2)+1) (5,7) (-5,7) ($(P.vertexX10_1)+1,$(P.vertexX10_2)+1) (3,1) (5,0) (-5,-1)" />
  </graph>
  $P.vertices{assignNames="p1 p2 p3 p4 p5 p6 p7 p8 p9 p10"}
  
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let A = [-5, -1];
        let B = [1, 2];
        let C = [3, 4];
        let D = [5, 7];
        let E = [-5, 7];
        let F = [3, 1];
        let G = [5, 0];
        let A1 = [A[0] + 1, A[1] + 1];
        let A2 = [A[0] + 2, A[1] + 2];
        let A3 = [A[0] + 3, A[1] + 3];

        cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(A3[0])},${nInDOM(A3[1])})`,
        );

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A3);
            expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
            expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
            expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A2);
            expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
            expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
            expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A1);
            expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
            expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
            expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
        });

        cy.log("move first vertex");
        cy.window().then(async (win) => {
            A = [-4, -9];
            A1 = [A[0] + 1, A[1] + 1];
            A2 = [A[0] + 2, A[1] + 2];
            A3 = [A[0] + 3, A[1] + 3];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 0: A3 },
                },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A3[0])},${nInDOM(A3[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A3);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A2);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A1);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move second vertex");
        cy.window().then(async (win) => {
            B = [8, 9];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 1: B },
                },
            });

            cy.get(cesc("#\\/p2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(B[0])},${nInDOM(B[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A3);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A2);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A1);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move third vertex");
        cy.window().then(async (win) => {
            C = [-3, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 2: C },
                },
            });

            cy.get(cesc("#\\/p3") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(C[0])},${nInDOM(C[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A3);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A2);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A1);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move fourth vertex");
        cy.window().then(async (win) => {
            A = [7, 0];
            A1 = [A[0] + 1, A[1] + 1];
            A2 = [A[0] + 2, A[1] + 2];
            A3 = [A[0] + 3, A[1] + 3];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 3: A2 },
                },
            });

            cy.get(cesc("#\\/p4") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A2[0])},${nInDOM(A2[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A3);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A2);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A1);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move fifth vertex");
        cy.window().then(async (win) => {
            D = [-9, 1];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 4: D },
                },
            });

            cy.get(cesc("#\\/p5") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(D[0])},${nInDOM(D[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A3);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A2);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A1);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move sixth vertex");
        cy.window().then(async (win) => {
            E = [-3, 6];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 5: E },
                },
            });

            cy.get(cesc("#\\/p6") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(E[0])},${nInDOM(E[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A3);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A2);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A1);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move seventh vertex");
        cy.window().then(async (win) => {
            A = [2, -4];
            A1 = [A[0] + 1, A[1] + 1];
            A2 = [A[0] + 2, A[1] + 2];
            A3 = [A[0] + 3, A[1] + 3];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 6: A1 },
                },
            });

            cy.get(cesc("#\\/p7") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A1[0])},${nInDOM(A1[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A3);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A2);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A1);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move eighth vertex");
        cy.window().then(async (win) => {
            F = [6, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 7: F },
                },
            });

            cy.get(cesc("#\\/p8") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(F[0])},${nInDOM(F[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A3);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A2);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A1);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move nineth vertex");
        cy.window().then(async (win) => {
            G = [1, -8];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 8: G },
                },
            });

            cy.get(cesc("#\\/p9") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(G[0])},${nInDOM(G[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A3);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A2);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A1);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });

        cy.log("move tenth vertex");
        cy.window().then(async (win) => {
            A = [-6, 7];
            A1 = [A[0] + 1, A[1] + 1];
            A2 = [A[0] + 2, A[1] + 2];
            A3 = [A[0] + 3, A[1] + 3];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/P",
                args: {
                    pointCoords: { 9: A },
                },
            });

            cy.get(cesc("#\\/p10") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(A[0])},${nInDOM(A[1])})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/P"].stateValues.vertices[0]).eqls(A3);
                expect(stateVariables["/P"].stateValues.vertices[1]).eqls(B);
                expect(stateVariables["/P"].stateValues.vertices[2]).eqls(C);
                expect(stateVariables["/P"].stateValues.vertices[3]).eqls(A2);
                expect(stateVariables["/P"].stateValues.vertices[4]).eqls(D);
                expect(stateVariables["/P"].stateValues.vertices[5]).eqls(E);
                expect(stateVariables["/P"].stateValues.vertices[6]).eqls(A1);
                expect(stateVariables["/P"].stateValues.vertices[7]).eqls(F);
                expect(stateVariables["/P"].stateValues.vertices[8]).eqls(G);
                expect(stateVariables["/P"].stateValues.vertices[9]).eqls(A);
            });
        });
    });

    it("attract to polygon", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
    <polygon vertices=" (3,5) (-4,-1) (5,2)" />
    <point x="7" y="8">
      <constraints>
        <attractTo>$_polygon1</attractTo>
      </constraints>
    </point>
  </graph>
  $_point1{name="p1" displayDigits="8"}
  $_polygon1.vertices{assignNames="v1 v2 v3" displayDigits="8"}
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let x1 = 3,
            x2 = -4,
            x3 = 5;
        let y1 = 5,
            y2 = -1,
            y3 = 2;

        cy.log("point originally not attracted");

        cy.get(cesc("#\\/p1") + " .mjx-mrow").should("contain.text", `(7,8)`);

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/_point1"].stateValues.coords).eqls([
                "vector",
                7,
                8,
            ]);
        });

        cy.log("move point near segment 1");
        cy.window().then(async (win) => {
            let x = 1;
            let mseg1 = (y2 - y1) / (x2 - x1);
            let y = mseg1 * (x - x1) + y1 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(1.14`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();

                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(py).closeTo(mseg1 * (px - x1) + y1, 1e-6);
            });
        });

        cy.log("move point near segment 2");
        cy.window().then(async (win) => {
            let x = 3;
            let mseg2 = (y2 - y3) / (x2 - x3);
            let y = mseg2 * (x - x2) + y2 + 0.4;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(3.12`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(py).closeTo(mseg2 * (px - x2) + y2, 1e-6);
            });
        });

        cy.log("move point near segment between first and last vertices");
        cy.window().then(async (win) => {
            let x = 4;
            let mseg3 = (y1 - y3) / (x1 - x3);
            let y = mseg3 * (x - x3) + y3 + 0.2;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(3.90`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(py).closeTo(mseg3 * (px - x3) + y3, 1e-6);
            });
        });

        cy.log("move point just past first vertex");
        cy.window().then(async (win) => {
            let x = x1 + 0.2;
            let y = y1 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(3,5)`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x1, 1e-6);
                expect(py).closeTo(y1, 1e-6);
            });
        });

        cy.log("point not attracted along extension of first segment");
        cy.window().then(async (win) => {
            let x = 4;
            let mseg1 = (y2 - y1) / (x2 - x1);
            let y = mseg1 * (x - x1) + y1 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should("contain.text", `(4,`);

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x, 1e-6);
                expect(py).closeTo(y, 1e-6);
            });
        });

        cy.window().then(async (win) => {
            let x = -5;
            let mseg1 = (y2 - y1) / (x2 - x1);
            let y = mseg1 * (x - x1) + y1 - 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(-5)},`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x, 1e-6);
                expect(py).closeTo(y, 1e-6);
            });
        });

        cy.log("move point just past second vertex");
        cy.window().then(async (win) => {
            let x = x2 - 0.2;
            let y = y2 - 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(-4)},`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x2, 1e-6);
                expect(py).closeTo(y2, 1e-6);
            });
        });

        cy.log("point not attracted along extension of second segment");
        cy.window().then(async (win) => {
            let x = 6;
            let mseg2 = (y2 - y3) / (x2 - x3);
            let y = mseg2 * (x - x2) + y2 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should("contain.text", `(6,`);

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x, 1e-6);
                expect(py).closeTo(y, 1e-6);
            });
        });

        cy.window().then(async (win) => {
            let x = -5;
            let mseg2 = (y2 - y3) / (x2 - x3);
            let y = mseg2 * (x - x2) + y2 - 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(-5)},`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x, 1e-6);
                expect(py).closeTo(y, 1e-6);
            });
        });

        cy.log("move polygon so point attracts to first segment");
        cy.window().then(async (win) => {
            let moveX = -3;
            let moveY = -2;

            x1 += moveX;
            x2 += moveX;
            x3 += moveX;
            y1 += moveY;
            y2 += moveY;
            y3 += moveY;

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: [
                        [x1, y1],
                        [x2, y2],
                        [x3, y3],
                    ],
                },
            });

            cy.get(cesc("#\\/v1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x1)},${nInDOM(y1)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                let mseg1 = (y2 - y1) / (x2 - x1);

                expect(py).closeTo(mseg1 * (px - x1) + y1, 1e-6);
            });
        });

        cy.log("move second vertex so point attracts to second segment");
        cy.window().then(async (win) => {
            let moveX = -1;
            let moveY = 1;

            x2 += moveX;
            y2 += moveY;

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 1: [x2, y2] },
                },
            });

            cy.get(cesc("#\\/v2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x2)},${nInDOM(y2)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();

                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                let mseg2 = (y2 - y3) / (x2 - x3);

                expect(py).closeTo(mseg2 * (px - x2) + y2, 1e-6);
            });
        });
    });

    it("constrain to polygon", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
    <polygon vertices=" (3,5) (-4,-1) (5,2)" />
    <point x="7" y="8">
      <constraints>
        <constrainTo>$_polygon1</constrainTo>
      </constraints>
    </point>
  </graph>
  $_point1{name="p1" displayDigits="8"}
  $_polygon1.vertices{assignNames="v1 v2 v3" displayDigits="8"}
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let x1 = 3,
            x2 = -4,
            x3 = 5;
        let y1 = 5,
            y2 = -1,
            y3 = 2;

        cy.log("point originally constrained");

        cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
            "contain.text",
            `(${x1},${y1})`,
        );

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/_point1"].stateValues.coords).eqls([
                "vector",
                x1,
                y1,
            ]);
        });

        cy.log("move point near segment 1");
        cy.window().then(async (win) => {
            let x = 1;
            let mseg1 = (y2 - y1) / (x2 - x1);
            let y = mseg1 * (x - x1) + y1 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(1.14`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();

                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(py).closeTo(mseg1 * (px - x1) + y1, 1e-6);
            });
        });

        cy.log("move point near segment 2");
        cy.window().then(async (win) => {
            let x = 3;
            let mseg2 = (y2 - y3) / (x2 - x3);
            let y = mseg2 * (x - x2) + y2 + 0.4;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(3.12`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(py).closeTo(mseg2 * (px - x2) + y2, 1e-6);
            });
        });

        cy.log("move point near segment between first and last vertices");
        cy.window().then(async (win) => {
            let x = 4;
            let mseg3 = (y1 - y3) / (x1 - x3);
            let y = mseg3 * (x - x3) + y3 + 0.2;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(3.90`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(py).closeTo(mseg3 * (px - x3) + y3, 1e-6);
            });
        });

        cy.log("move point just past first vertex");
        cy.window().then(async (win) => {
            let x = x1 + 0.2;
            let y = y1 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(3,5)`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x1, 1e-6);
                expect(py).closeTo(y1, 1e-6);
            });
        });

        cy.log(
            "point along extension of first segment constrained to endpoint",
        );
        cy.window().then(async (win) => {
            let x = 4;
            let mseg1 = (y2 - y1) / (x2 - x1);
            let y = mseg1 * (x - x1) + y1 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x1)},${nInDOM(y1)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x1, 1e-6);
                expect(py).closeTo(y1, 1e-6);
            });
        });

        cy.window().then(async (win) => {
            let x = -5;
            let mseg1 = (y2 - y1) / (x2 - x1);
            let y = mseg1 * (x - x1) + y1 - 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x2)},${nInDOM(y2)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x2, 1e-6);
                expect(py).closeTo(y2, 1e-6);
            });
        });

        cy.log("move point just past second vertex");
        cy.window().then(async (win) => {
            let x = x2 - 0.2;
            let y = y2 - 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x2)},${nInDOM(y2)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x2, 1e-6);
                expect(py).closeTo(y2, 1e-6);
            });
        });

        cy.log(
            "point along extension of second segment constrained to endpoint",
        );
        cy.window().then(async (win) => {
            let x = 6;
            let mseg2 = (y2 - y3) / (x2 - x3);
            let y = mseg2 * (x - x2) + y2 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x3)},${nInDOM(y3)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x3, 1e-6);
                expect(py).closeTo(y3, 1e-6);
            });
        });

        cy.window().then(async (win) => {
            let x = -5;
            let mseg2 = (y2 - y3) / (x2 - x3);
            let y = mseg2 * (x - x2) + y2 - 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x2)},${nInDOM(y2)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x2, 1e-6);
                expect(py).closeTo(y2, 1e-6);
            });
        });

        cy.log("move polygon so point constrained to first segment");
        cy.window().then(async (win) => {
            let moveX = -3;
            let moveY = -5;

            x1 += moveX;
            x2 += moveX;
            x3 += moveX;
            y1 += moveY;
            y2 += moveY;
            y3 += moveY;

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: [
                        [x1, y1],
                        [x2, y2],
                        [x3, y3],
                    ],
                },
            });

            cy.get(cesc("#\\/v1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x1)},${nInDOM(y1)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                let mseg1 = (y2 - y1) / (x2 - x1);

                expect(py).closeTo(mseg1 * (px - x1) + y1, 1e-6);
            });
        });

        cy.log("move second vertex so point constrained to second segment");
        cy.window().then(async (win) => {
            let moveX = -1;
            let moveY = 8;

            x2 += moveX;
            y2 += moveY;

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 1: [x2, y2] },
                },
            });

            cy.get(cesc("#\\/v2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x2)},${nInDOM(y2)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();

                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                let mseg2 = (y2 - y3) / (x2 - x3);

                expect(py).closeTo(mseg2 * (px - x2) + y2, 1e-6);
            });
        });
    });

    it("constrain to polygon, different scales from graph", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph xmin="-110" xmax="110" ymin="-0.11" ymax="0.11">
    <polygon vertices="(-50,-0.02) (-40,0.07) (70,0.06) (10,-0.01)" name="p" />
    <point x="0" y="0.01" name="A">
      <constraints>
        <constrainTo relativeToGraphScales>$p</constrainTo>
      </constraints>
    </point>
  </graph>
  $A{name="A2"}
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let x1 = -50,
            x2 = -40,
            x3 = 70,
            x4 = 10;
        let y1 = -0.02,
            y2 = 0.07,
            y3 = 0.06,
            y4 = -0.01;

        cy.log("point originally on segment 3");

        cy.get(cesc("#\\/A2") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(15)}`,
        );

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();

            let mseg3 = (y4 - y3) / (x4 - x3);

            let px = stateVariables["/A"].stateValues.xs[0];
            let py = stateVariables["/A"].stateValues.xs[1];

            expect(py).closeTo(mseg3 * (px - x3) + y3, 1e-6);
        });

        cy.log("move point near segment 1");
        cy.window().then(async (win) => {
            let mseg1 = (y2 - y1) / (x2 - x1);

            win.callAction1({
                actionName: "movePoint",
                componentName: `/A`,
                args: { x: -20, y: 0.02 },
            });

            cy.get(cesc("#\\/A2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(-45)}`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/A"].stateValues.xs[0];
                let py = stateVariables["/A"].stateValues.xs[1];

                expect(py).closeTo(mseg1 * (px - x1) + y1, 1e-6);
            });
        });

        cy.log("move point near segment 2");
        cy.window().then(async (win) => {
            let mseg2 = (y2 - y3) / (x2 - x3);

            win.callAction1({
                actionName: "movePoint",
                componentName: `/A`,
                args: { x: 0, y: 0.04 },
            });

            cy.get(cesc("#\\/A2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(2.3)}`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/A"].stateValues.xs[0];
                let py = stateVariables["/A"].stateValues.xs[1];

                expect(py).closeTo(mseg2 * (px - x2) + y2, 1e-6);
            });
        });

        cy.log("move point near segment 4");
        cy.window().then(async (win) => {
            let mseg4 = (y4 - y1) / (x4 - x1);

            win.callAction1({
                actionName: "movePoint",
                componentName: `/A`,
                args: { x: -10, y: 0.02 },
            });

            cy.get(cesc("#\\/A2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(-4.5)}`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/A"].stateValues.xs[0];
                let py = stateVariables["/A"].stateValues.xs[1];

                expect(py).closeTo(mseg4 * (px - x4) + y4, 1e-6);
            });
        });
    });

    it("constrain to interior of polygon", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
    <polygon vertices=" (3,5) (-4,-1) (5,2)" filled />
    <point x="7" y="8">
      <constraints>
        <constrainToInterior>$_polygon1</constrainToInterior>
      </constraints>
    </point>
  </graph>
  $_point1{name="p1" displayDigits="8"}
  $_polygon1.vertices{assignNames="v1 v2 v3" displayDigits="8"}
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let x1 = 3,
            x2 = -4,
            x3 = 5;
        let y1 = 5,
            y2 = -1,
            y3 = 2;

        cy.log("point originally constrained");

        cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
            "contain.text",
            `(${x1},${y1})`,
        );

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/_point1"].stateValues.coords).eqls([
                "vector",
                x1,
                y1,
            ]);
        });

        cy.log("move point near segment 1, outside polygon");
        cy.window().then(async (win) => {
            let x = 1;
            let mseg1 = (y2 - y1) / (x2 - x1);
            let y = mseg1 * (x - x1) + y1 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(1.14`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();

                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(py).closeTo(mseg1 * (px - x1) + y1, 1e-6);
            });
        });

        cy.log("move point near segment 2, but inside polygon");
        cy.window().then(async (win) => {
            let x = 3;
            let y = 1.5;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(3,1.5)`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(3, 1e-12);
                expect(py).closeTo(1.5, 1e-12);
            });
        });

        cy.log(
            "move point near segment between first and last vertices, but outside polygon",
        );
        cy.window().then(async (win) => {
            let x = 4;
            let mseg3 = (y1 - y3) / (x1 - x3);
            let y = mseg3 * (x - x3) + y3 + 0.2;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(3.90`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(py).closeTo(mseg3 * (px - x3) + y3, 1e-6);
            });
        });

        cy.log("move point just past first vertex");
        cy.window().then(async (win) => {
            let x = x1 + 0.2;
            let y = y1 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(3,5)`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x1, 1e-6);
                expect(py).closeTo(y1, 1e-6);
            });
        });

        cy.log(
            "point along extension of first segment constrained to endpoint",
        );
        cy.window().then(async (win) => {
            let x = 4;
            let mseg1 = (y2 - y1) / (x2 - x1);
            let y = mseg1 * (x - x1) + y1 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x1)},${nInDOM(y1)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x1, 1e-6);
                expect(py).closeTo(y1, 1e-6);
            });
        });

        cy.window().then(async (win) => {
            let x = -5;
            let mseg1 = (y2 - y1) / (x2 - x1);
            let y = mseg1 * (x - x1) + y1 - 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x2)},${nInDOM(y2)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x2, 1e-6);
                expect(py).closeTo(y2, 1e-6);
            });
        });

        cy.log("move point just past second vertex");
        cy.window().then(async (win) => {
            let x = x2 - 0.2;
            let y = y2 - 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x2)},${nInDOM(y2)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x2, 1e-6);
                expect(py).closeTo(y2, 1e-6);
            });
        });

        cy.log(
            "point along extension of second segment constrained to endpoint",
        );
        cy.window().then(async (win) => {
            let x = 6;
            let mseg2 = (y2 - y3) / (x2 - x3);
            let y = mseg2 * (x - x2) + y2 + 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x3)},${nInDOM(y3)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x3, 1e-6);
                expect(py).closeTo(y3, 1e-6);
            });
        });

        cy.log("repeat for other side of second segment");
        let xsave, ysave;
        cy.window().then(async (win) => {
            let x = -5;
            let mseg2 = (y2 - y3) / (x2 - x3);
            let y = mseg2 * (x - x2) + y2 - 0.3;

            win.callAction1({
                actionName: "movePoint",
                componentName: `/_point1`,
                args: { x, y },
            });

            cy.get(cesc("#\\/p1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x2)},${nInDOM(y2)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                expect(px).closeTo(x2, 1e-6);
                expect(py).closeTo(y2, 1e-6);
            });

            // save point coordinates, as is last time move point
            xsave = x2;
            ysave = y2;
        });

        cy.log("move polygon so point constrained to first segment");
        cy.window().then(async (win) => {
            let moveX = -3;
            let moveY = -5;

            x1 += moveX;
            x2 += moveX;
            x3 += moveX;
            y1 += moveY;
            y2 += moveY;
            y3 += moveY;

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: [
                        [x1, y1],
                        [x2, y2],
                        [x3, y3],
                    ],
                },
            });

            cy.get(cesc("#\\/v1") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x1)},${nInDOM(y1)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                let mseg1 = (y2 - y1) / (x2 - x1);

                expect(py).closeTo(mseg1 * (px - x1) + y1, 1e-6);
            });
        });

        cy.log("move second vertex so point constrained to second segment");
        cy.window().then(async (win) => {
            let moveX = -1;
            let moveY = 8;

            x2 += moveX;
            y2 += moveY;

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 1: [x2, y2] },
                },
            });

            cy.get(cesc("#\\/v2") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x2)},${nInDOM(y2)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();

                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                let mseg2 = (y2 - y3) / (x2 - x3);

                expect(py).closeTo(mseg2 * (px - x2) + y2, 1e-6);
            });
        });

        cy.log("move third vertex so point is in interior");
        cy.window().then(async (win) => {
            x3 = -4;
            y3 = -6;

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/_polygon1",
                args: {
                    pointCoords: { 2: [x3, y3] },
                },
            });

            cy.get(cesc("#\\/v3") + " .mjx-mrow").should(
                "contain.text",
                `(${nInDOM(x3)},${nInDOM(y3)})`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();

                let px = stateVariables["/_point1"].stateValues.xs[0];
                let py = stateVariables["/_point1"].stateValues.xs[1];

                // point moves to coordinates where last moved the point
                expect(px).closeTo(xsave, 1e-6);
                expect(py).closeTo(ysave, 1e-6);
            });
        });
    });

    it("constrain to interior of non-simple polygon", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
    <polygon vertices="(2,0) (8,0) (8,8) (0,8) (0,4) (6,4) (6,2) (4,2) (4,6) (2,6)" filled name="pg" />
    <point x="7" y="6" name="P">
      <constraints>
        <constrainToInterior>$pg</constrainToInterior>
      </constraints>
    </point>
  </graph>
  $P{name="p1" displayDigits="8"}
  `,
                },
                "*",
            );
        });
        cy.get(cesc2("#/_text1")).should("have.text", "a"); //wait for page to load

        cy.log("point originally in interior");

        cy.get(cesc2("#/p1") + " .mjx-mrow").should("contain.text", `(7,6)`);

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            let px = stateVariables["/P"].stateValues.xs[0];
            let py = stateVariables["/P"].stateValues.xs[1];
            expect(px).closeTo(7, 1e-12);
            expect(py).closeTo(6, 1e-12);
        });

        cy.log("move point above polygon");
        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePoint",
                componentName: `/P`,
                args: { x: 3, y: 10 },
            });

            cy.get(cesc2("#/p1") + " .mjx-mrow").should(
                "contain.text",
                `(3,8)`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();

                let px = stateVariables["/P"].stateValues.xs[0];
                let py = stateVariables["/P"].stateValues.xs[1];
                expect(px).closeTo(3, 1e-12);
                expect(py).closeTo(8, 1e-12);
            });
        });

        cy.log("move point inside doubly wound region");
        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePoint",
                componentName: `/P`,
                args: { x: 3, y: 5 },
            });

            cy.get(cesc2("#/p1") + " .mjx-mrow").should(
                "contain.text",
                `(3,5)`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/P"].stateValues.xs[0];
                let py = stateVariables["/P"].stateValues.xs[1];
                expect(px).closeTo(3, 1e-12);
                expect(py).closeTo(5, 1e-12);
            });
        });

        cy.log("attempt to move point inside zero wound region");
        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePoint",
                componentName: `/P`,
                args: { x: 4.9, y: 3 },
            });

            cy.get(cesc2("#/p1") + " .mjx-mrow").should(
                "contain.text",
                `(4,3)`,
            );

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                let px = stateVariables["/P"].stateValues.xs[0];
                let py = stateVariables["/P"].stateValues.xs[1];
                expect(px).closeTo(4, 1e-12);
                expect(py).closeTo(3, 1e-12);
            });
        });
    });

    it("fixed polygon", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph>
    <polygon vertices="(1,3) (5,7) (-2,6)" name="p" fixed />
  </graph>
  <textinput name="ti" />
  $ti.value{assignNames="t"}
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/p"].stateValues.vertices[0]).eqls([1, 3]);
            expect(stateVariables["/p"].stateValues.vertices[1]).eqls([5, 7]);
            expect(stateVariables["/p"].stateValues.vertices[2]).eqls([-2, 6]);
            expect(stateVariables["/p"].stateValues.fixed).eq(true);
        });

        cy.log("cannot move vertices");
        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: [
                        [4, 7],
                        [8, 10],
                        [1, 9],
                    ],
                },
            });

            // to make sure waited for core to react,
            // wait for text to change from change in textinput
            cy.get(cesc("#\\/ti_input")).type("wait{enter}");
            cy.get(cesc("#\\/t")).should("have.text", "wait");

            cy.window().then(async (win) => {
                let stateVariables = await win.returnAllStateVariables1();
                expect(stateVariables["/p"].stateValues.vertices[0]).eqls([
                    1, 3,
                ]);
                expect(stateVariables["/p"].stateValues.vertices[1]).eqls([
                    5, 7,
                ]);
                expect(stateVariables["/p"].stateValues.vertices[2]).eqls([
                    -2, 6,
                ]);
            });
        });
    });

    it("copy propIndex of vertices", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
    <text>a</text>
    <graph>
      <polygon vertices="(2,-3) (3,4) (-3,4)" />
    </graph>
 
    <p><mathinput name="n" /></p>

    <p><copy prop="vertices" target="_polygon1" propIndex="$n" assignNames="P1 P2 P3" /></p>

    <p><copy prop="vertex2" target="_polygon1" propIndex="$n" assignNames="x" /></p>
    `,
                },
                "*",
            );
        });

        cy.get(cesc("#\\/_text1")).should("have.text", "a"); // to wait for page to load

        let t1x = 2,
            t1y = -3;
        let t2x = 3,
            t2y = 4;
        let t3x = -3,
            t3y = 4;

        cy.get(cesc("#\\/P1") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P2") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P3") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/x") + " .mjx-mrow").should("not.exist");

        cy.get(cesc("#\\/n") + " textarea").type("1{enter}", { force: true });
        cy.get(cesc("#\\/P1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(t1x)},${nInDOM(t1y)})`,
        );
        cy.get(cesc("#\\/P2") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P3") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/x") + " .mjx-mrow").should(
            "contain.text",
            `${nInDOM(t2x)}`,
        );

        cy.get(cesc("#\\/n") + " textarea").type("{end}{backspace}2{enter}", {
            force: true,
        });
        cy.get(cesc("#\\/P1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(t2x)},${nInDOM(t2y)})`,
        );
        cy.get(cesc("#\\/P2") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P3") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/x") + " .mjx-mrow").should(
            "contain.text",
            `${nInDOM(t2y)}`,
        );

        cy.get(cesc("#\\/n") + " textarea").type("{end}{backspace}3{enter}", {
            force: true,
        });
        cy.get(cesc("#\\/P1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(t3x)},${nInDOM(t3y)})`,
        );
        cy.get(cesc("#\\/P2") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P3") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/x") + " .mjx-mrow").should("not.exist");

        cy.get(cesc("#\\/n") + " textarea").type("{end}{backspace}4{enter}", {
            force: true,
        });
        cy.get(cesc("#\\/P1") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P2") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P3") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/x") + " .mjx-mrow").should("not.exist");
    });

    it("copy propIndex of vertices, dot and array notation", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
    <text>a</text>
    <graph>
      <polygon vertices="(2,-3) (3,4) (-3,4)" />
    </graph>
 
    <p><mathinput name="n" /></p>

    <p><copy source="_polygon1.vertices[$n]" assignNames="P1 P2 P3" /></p>

    <p><copy source="_polygon1.vertex2[$n]" assignNames="x" /></p>

    <p><copy source="_polygon1.vertices[2][$n]" assignNames="xa" /></p>
    `,
                },
                "*",
            );
        });

        cy.get(cesc("#\\/_text1")).should("have.text", "a"); // to wait for page to load

        let t1x = 2,
            t1y = -3;
        let t2x = 3,
            t2y = 4;
        let t3x = -3,
            t3y = 4;

        cy.get(cesc("#\\/P1") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P2") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P3") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/x") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/xa") + " .mjx-mrow").should("not.exist");

        cy.get(cesc("#\\/n") + " textarea").type("1{enter}", { force: true });
        cy.get(cesc("#\\/P1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(t1x)},${nInDOM(t1y)})`,
        );
        cy.get(cesc("#\\/P2") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P3") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/x") + " .mjx-mrow").should(
            "contain.text",
            `${nInDOM(t2x)}`,
        );
        cy.get(cesc("#\\/xa") + " .mjx-mrow").should(
            "contain.text",
            `${nInDOM(t2x)}`,
        );

        cy.get(cesc("#\\/n") + " textarea").type("{end}{backspace}2{enter}", {
            force: true,
        });
        cy.get(cesc("#\\/P1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(t2x)},${nInDOM(t2y)})`,
        );
        cy.get(cesc("#\\/P2") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P3") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/x") + " .mjx-mrow").should(
            "contain.text",
            `${nInDOM(t2y)}`,
        );
        cy.get(cesc("#\\/xa") + " .mjx-mrow").should(
            "contain.text",
            `${nInDOM(t2y)}`,
        );

        cy.get(cesc("#\\/n") + " textarea").type("{end}{backspace}3{enter}", {
            force: true,
        });
        cy.get(cesc("#\\/P1") + " .mjx-mrow").should(
            "contain.text",
            `(${nInDOM(t3x)},${nInDOM(t3y)})`,
        );
        cy.get(cesc("#\\/P2") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P3") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/x") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/xa") + " .mjx-mrow").should("not.exist");

        cy.get(cesc("#\\/n") + " textarea").type("{end}{backspace}4{enter}", {
            force: true,
        });
        cy.get(cesc("#\\/P1") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P2") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/P3") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/x") + " .mjx-mrow").should("not.exist");
        cy.get(cesc("#\\/xa") + " .mjx-mrow").should("not.exist");
    });

    it("polygon from vector operations", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
    <text>a</text>
    <math name="m" fixed>(-3,2)</math>
    <graph>
      <point name="P">(2,1)</point>
      <polygon vertices="2(2,-3)+(3,4) 3$P $P+2$m" name="polygon" />
    </graph>
 
    <p><copy source="polygon.vertices" assignNames="P1 P2 P3" /></p>

    `,
                },
                "*",
            );
        });

        cy.get(cesc2("#/m") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(−3,2)");
        cy.get(cesc2("#/P1") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(7,−2)");
        cy.get(cesc2("#/P2") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(6,3)");
        cy.get(cesc2("#/P3") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(−4,5)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/polygon"].stateValues.vertices).eqls([
                [7, -2],
                [6, 3],
                [-4, 5],
            ]);
        });

        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/polygon",
                args: {
                    pointCoords: { 0: [3, 5] },
                },
            });
        });

        cy.get(cesc2("#/P1") + " .mjx-mrow").should("contain.text", "(3,5)");
        cy.get(cesc2("#/P2") + " .mjx-mrow").should("contain.text", "(6,3)");
        cy.get(cesc2("#/P3") + " .mjx-mrow").should("contain.text", "(−4,5)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/polygon"].stateValues.vertices).eqls([
                [3, 5],
                [6, 3],
                [-4, 5],
            ]);
        });

        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/polygon",
                args: {
                    pointCoords: { 1: [-9, -6] },
                },
            });
        });

        cy.get(cesc2("#/P1") + " .mjx-mrow").should("contain.text", "(3,5)");
        cy.get(cesc2("#/P2") + " .mjx-mrow").should("contain.text", "(−9,−6)");
        cy.get(cesc2("#/P3") + " .mjx-mrow").should("contain.text", "(−9,2)");

        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/polygon",
                args: {
                    pointCoords: { 2: [-3, 1] },
                },
            });
        });

        cy.get(cesc2("#/P1") + " .mjx-mrow").should("contain.text", "(3,5)");
        cy.get(cesc2("#/P2") + " .mjx-mrow").should("contain.text", "(9,−9)");
        cy.get(cesc2("#/P3") + " .mjx-mrow").should("contain.text", "(−3,1)");
    });

    it("polygon from vector operations, create individual vectors", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
    <text>a</text>
    <math name="m" fixed>(-3,2)</math>
    <graph>
      <point name="P">(2,1)</point>
      <polygon vertices="$v1 $v2 $v3" name="polygon" />
      <vector name="v1">2(2,-3)+(3,4)</vector>
      <vector name="v2">3$P</vector>
      <vector name="v3">$P+2$m</vector>

    </graph>
 
    <p><copy source="polygon.vertices" assignNames="P1 P2 P3" /></p>

    `,
                },
                "*",
            );
        });

        cy.get(cesc2("#/m") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(−3,2)");
        cy.get(cesc2("#/P1") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(7,−2)");
        cy.get(cesc2("#/P2") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(6,3)");
        cy.get(cesc2("#/P3") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(−4,5)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/polygon"].stateValues.vertices).eqls([
                [7, -2],
                [6, 3],
                [-4, 5],
            ]);
        });

        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/polygon",
                args: {
                    pointCoords: { 0: [3, 5] },
                },
            });
        });

        cy.get(cesc2("#/P1") + " .mjx-mrow").should("contain.text", "(3,5)");
        cy.get(cesc2("#/P2") + " .mjx-mrow").should("contain.text", "(6,3)");
        cy.get(cesc2("#/P3") + " .mjx-mrow").should("contain.text", "(−4,5)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/polygon"].stateValues.vertices).eqls([
                [3, 5],
                [6, 3],
                [-4, 5],
            ]);
        });

        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/polygon",
                args: {
                    pointCoords: { 1: [-9, -6] },
                },
            });
        });

        cy.get(cesc2("#/P1") + " .mjx-mrow").should("contain.text", "(3,5)");
        cy.get(cesc2("#/P2") + " .mjx-mrow").should("contain.text", "(−9,−6)");
        cy.get(cesc2("#/P3") + " .mjx-mrow").should("contain.text", "(−9,2)");

        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/polygon",
                args: {
                    pointCoords: { 2: [-3, 1] },
                },
            });
        });

        cy.get(cesc2("#/P1") + " .mjx-mrow").should("contain.text", "(3,5)");
        cy.get(cesc2("#/P2") + " .mjx-mrow").should("contain.text", "(9,−9)");
        cy.get(cesc2("#/P3") + " .mjx-mrow").should("contain.text", "(−3,1)");
    });

    it("changing styles", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
    <text>a</text>
    <setup>
      <styledefinitions>
        <styledefinition stylenumber="1" lineColor="blue" fillColor="blue" lineWidth="2" lineStyle="solid" />
        <styledefinition stylenumber="2" lineColor="red" fillColor="green" lineWidth="2" lineStyle="solid" />

        <styledefinition stylenumber="3" lineColor="blue" fillColor="blue" lineWidth="5" lineStyle="solid" />
        <styledefinition stylenumber="4" lineColor="red" fillColor="green" lineWidth="1" lineStyle="dotted" />
        </styledefinitions>
    </setup>

    <graph>
      <polygon vertices="(0,0) (0,2) (2,0)" name="p1" />
      <polygon vertices="(3,0) (3,2) (5,0)" name="p2" filled />
      <polygon vertices="(0,3) (0,5) (2,3)" name="p3" stylenumber="2" />
      <polygon vertices="(3,3) (3,5) (5,3)" name="p4" stylenumber="2" filled />

      <polygon vertices="(0,-10) (0,-8) (2,-10)" name="p5" stylenumber="3"/>
      <polygon vertices="(3,-10) (3,-8) (5,-10)" name="p6" stylenumber="3" filled />
      <polygon vertices="(0,-7) (0,-5) (2,-7)" name="p7" stylenumber="4" />
      <polygon vertices="(3,-7) (3,-5) (5,-7)" name="p8" stylenumber="4" filled />

    </graph>

    <p>First polygon is $p1.styleDescription{assignNames="st1"}.  It is a $p1.styleDescriptionWithNoun{assignNames="stn1"}. 
      Its border is $p1.borderStyleDescription{assignNames="bst1"}.  Its fill is $p1.fillStyleDescription{assignNames="fst1"}.
    </p>
    <p>Second polygon is $p2.styleDescription{assignNames="st2"}.  It is a $p2.styleDescriptionWithNoun{assignNames="stn2"}. 
      Its border is $p2.borderStyleDescription{assignNames="bst2"}.  Its fill is $p2.fillStyleDescription{assignNames="fst2"}.
    </p>
    <p>Third polygon is $p3.styleDescription{assignNames="st3"}.  It is a $p3.styleDescriptionWithNoun{assignNames="stn3"}. 
      Its border is $p3.borderStyleDescription{assignNames="bst3"}.  Its fill is $p3.fillStyleDescription{assignNames="fst3"}.
    </p>
    <p>Fourth polygon is $p4.styleDescription{assignNames="st4"}.  It is a $p4.styleDescriptionWithNoun{assignNames="stn4"}. 
      Its border is $p4.borderStyleDescription{assignNames="bst4"}.  Its fill is $p4.fillStyleDescription{assignNames="fst4"}.
    </p>

    <p>Fifth polygon is $p5.styleDescription{assignNames="st5"}.  It is a $p5.styleDescriptionWithNoun{assignNames="stn5"}. 
      Its border is $p5.borderStyleDescription{assignNames="bst5"}.  Its fill is $p5.fillStyleDescription{assignNames="fst5"}.
    </p>
    <p>Sixth polygon is $p6.styleDescription{assignNames="st6"}.  It is a $p6.styleDescriptionWithNoun{assignNames="stn6"}. 
      Its border is $p6.borderStyleDescription{assignNames="bst6"}.  Its fill is $p6.fillStyleDescription{assignNames="fst6"}.
    </p>
    <p>Seventh polygon is $p7.styleDescription{assignNames="st7"}.  It is a $p7.styleDescriptionWithNoun{assignNames="stn7"}. 
      Its border is $p7.borderStyleDescription{assignNames="bst7"}.  Its fill is $p7.fillStyleDescription{assignNames="fst7"}.
    </p>
    <p>Eighth polygon is $p8.styleDescription{assignNames="st8"}.  It is a $p8.styleDescriptionWithNoun{assignNames="stn8"}. 
      Its border is $p8.borderStyleDescription{assignNames="bst8"}.  Its fill is $p8.fillStyleDescription{assignNames="fst8"}.
    </p>


    `,
                },
                "*",
            );
        });

        cy.get(cesc("#\\/_text1")).should("have.text", "a"); // to wait for page to load

        cy.get(cesc("#\\/st1")).should("have.text", "blue");
        cy.get(cesc("#\\/stn1")).should("have.text", "blue polygon");
        cy.get(cesc("#\\/bst1")).should("have.text", "blue");
        cy.get(cesc("#\\/fst1")).should("have.text", "unfilled");

        cy.get(cesc("#\\/st2")).should("have.text", "filled blue");
        cy.get(cesc("#\\/stn2")).should("have.text", "filled blue polygon");
        cy.get(cesc("#\\/bst2")).should("have.text", "blue");
        cy.get(cesc("#\\/fst2")).should("have.text", "blue");

        cy.get(cesc("#\\/st3")).should("have.text", "red");
        cy.get(cesc("#\\/stn3")).should("have.text", "red polygon");
        cy.get(cesc("#\\/bst3")).should("have.text", "red");
        cy.get(cesc("#\\/fst3")).should("have.text", "unfilled");

        cy.get(cesc("#\\/st4")).should(
            "have.text",
            "filled green with red border",
        );
        cy.get(cesc("#\\/stn4")).should(
            "have.text",
            "filled green polygon with a red border",
        );
        cy.get(cesc("#\\/bst4")).should("have.text", "red");
        cy.get(cesc("#\\/fst4")).should("have.text", "green");

        cy.get(cesc("#\\/st5")).should("have.text", "thick blue");
        cy.get(cesc("#\\/stn5")).should("have.text", "thick blue polygon");
        cy.get(cesc("#\\/bst5")).should("have.text", "thick blue");
        cy.get(cesc("#\\/fst5")).should("have.text", "unfilled");

        cy.get(cesc("#\\/st6")).should(
            "have.text",
            "filled blue with thick border",
        );
        cy.get(cesc("#\\/stn6")).should(
            "have.text",
            "filled blue polygon with a thick border",
        );
        cy.get(cesc("#\\/bst6")).should("have.text", "thick blue");
        cy.get(cesc("#\\/fst6")).should("have.text", "blue");

        cy.get(cesc("#\\/st7")).should("have.text", "thin dotted red");
        cy.get(cesc("#\\/stn7")).should("have.text", "thin dotted red polygon");
        cy.get(cesc("#\\/bst7")).should("have.text", "thin dotted red");
        cy.get(cesc("#\\/fst7")).should("have.text", "unfilled");

        cy.get(cesc("#\\/st8")).should(
            "have.text",
            "filled green with thin dotted red border",
        );
        cy.get(cesc("#\\/stn8")).should(
            "have.text",
            "filled green polygon with a thin dotted red border",
        );
        cy.get(cesc("#\\/bst8")).should("have.text", "thin dotted red");
        cy.get(cesc("#\\/fst8")).should("have.text", "green");
    });

    it("draggable, vertices draggable", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <graph>
    <polygon vertices="(1,3) (5,7) (-2,6)" name="p" draggable="$draggable" verticesDraggable="$verticesDraggable" />
  </graph>
  <p>To wait: <booleaninput name="bi" /> <boolean copySource="bi" name="bi2" /></p>
  <p>draggable: <booleaninput name="draggable" /> <boolean copySource="p.draggable" name="d2" /></p>
  <p>vertices draggable: <booleaninput name="verticesDraggable" /> <boolean copySource="p.verticesDraggable" name="vd2" /></p>
  <p name="pvert">all vertices: $p.vertices</p>
  `,
                },
                "*",
            );
        });

        cy.get(cesc("#\\/d2")).should("have.text", "false");
        cy.get(cesc("#\\/vd2")).should("have.text", "false");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(1,3)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(2)
            .should("have.text", "(5,7)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(4)
            .should("have.text", "(−2,6)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/p"].stateValues.vertices[0]).eqls([1, 3]);
            expect(stateVariables["/p"].stateValues.vertices[1]).eqls([5, 7]);
            expect(stateVariables["/p"].stateValues.vertices[2]).eqls([-2, 6]);
            expect(stateVariables["/p"].stateValues.draggable).eq(false);
            expect(stateVariables["/p"].stateValues.verticesDraggable).eq(
                false,
            );
        });

        cy.log("cannot move single vertex");
        cy.window().then(async (win) => {
            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: { 0: [4, 7] },
                },
            });
        });

        // wait for core to process click
        cy.get(cesc("#\\/bi")).click();
        cy.get(cesc("#\\/bi2")).should("have.text", "true");

        cy.get(cesc("#\\/d2")).should("have.text", "false");
        cy.get(cesc("#\\/vd2")).should("have.text", "false");

        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(1,3)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(2)
            .should("have.text", "(5,7)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(4)
            .should("have.text", "(−2,6)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/p"].stateValues.vertices[0]).eqls([1, 3]);
            expect(stateVariables["/p"].stateValues.vertices[1]).eqls([5, 7]);
            expect(stateVariables["/p"].stateValues.vertices[2]).eqls([-2, 6]);
            expect(stateVariables["/p"].stateValues.draggable).eq(false);
            expect(stateVariables["/p"].stateValues.verticesDraggable).eq(
                false,
            );
        });

        cy.log("cannot move all vertices");
        cy.window().then(async (win) => {
            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: [
                        [4, 7],
                        [8, 10],
                        [1, 9],
                    ],
                },
            });
        });

        // wait for core to process click
        cy.get(cesc("#\\/bi")).click();
        cy.get(cesc("#\\/bi2")).should("have.text", "false");

        cy.get(cesc("#\\/d2")).should("have.text", "false");
        cy.get(cesc("#\\/vd2")).should("have.text", "false");

        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(1,3)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(2)
            .should("have.text", "(5,7)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(4)
            .should("have.text", "(−2,6)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/p"].stateValues.vertices[0]).eqls([1, 3]);
            expect(stateVariables["/p"].stateValues.vertices[1]).eqls([5, 7]);
            expect(stateVariables["/p"].stateValues.vertices[2]).eqls([-2, 6]);
            expect(stateVariables["/p"].stateValues.draggable).eq(false);
            expect(stateVariables["/p"].stateValues.verticesDraggable).eq(
                false,
            );
        });

        cy.log("only vertices draggable");

        cy.get(cesc("#\\/verticesDraggable")).click();
        cy.get(cesc("#\\/vd2")).should("have.text", "true");

        cy.log("can move single vertex");
        cy.window().then(async (win) => {
            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: { 0: [4, 7] },
                },
            });
        });

        cy.get(cesc("#\\/pvert") + " .mjx-mrow").should(
            "contain.text",
            "(4,7)",
        );

        cy.get(cesc("#\\/d2")).should("have.text", "false");
        cy.get(cesc("#\\/vd2")).should("have.text", "true");

        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(4,7)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(2)
            .should("have.text", "(5,7)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(4)
            .should("have.text", "(−2,6)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/p"].stateValues.vertices[0]).eqls([4, 7]);
            expect(stateVariables["/p"].stateValues.vertices[1]).eqls([5, 7]);
            expect(stateVariables["/p"].stateValues.vertices[2]).eqls([-2, 6]);
            expect(stateVariables["/p"].stateValues.draggable).eq(false);
            expect(stateVariables["/p"].stateValues.verticesDraggable).eq(true);
        });

        cy.log("cannot move all vertices");
        cy.window().then(async (win) => {
            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: [
                        [3, 8],
                        [8, 10],
                        [1, 9],
                    ],
                },
            });
        });

        // wait for core to process click
        cy.get(cesc("#\\/bi")).click();
        cy.get(cesc("#\\/bi2")).should("have.text", "true");

        cy.get(cesc("#\\/d2")).should("have.text", "false");
        cy.get(cesc("#\\/vd2")).should("have.text", "true");

        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(4,7)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(2)
            .should("have.text", "(5,7)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(4)
            .should("have.text", "(−2,6)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/p"].stateValues.vertices[0]).eqls([4, 7]);
            expect(stateVariables["/p"].stateValues.vertices[1]).eqls([5, 7]);
            expect(stateVariables["/p"].stateValues.vertices[2]).eqls([-2, 6]);
            expect(stateVariables["/p"].stateValues.draggable).eq(false);
            expect(stateVariables["/p"].stateValues.verticesDraggable).eq(true);
        });

        cy.log("vertices and polygon draggable");

        cy.get(cesc("#\\/draggable")).click();
        cy.get(cesc("#\\/d2")).should("have.text", "true");

        cy.log("can move single vertex");
        cy.window().then(async (win) => {
            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: { 1: [-3, 2] },
                },
            });
        });

        cy.get(cesc("#\\/pvert") + " .mjx-mrow").should(
            "contain.text",
            "(−3,2)",
        );

        cy.get(cesc("#\\/d2")).should("have.text", "true");
        cy.get(cesc("#\\/vd2")).should("have.text", "true");

        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(4,7)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(2)
            .should("have.text", "(−3,2)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(4)
            .should("have.text", "(−2,6)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/p"].stateValues.vertices[0]).eqls([4, 7]);
            expect(stateVariables["/p"].stateValues.vertices[1]).eqls([-3, 2]);
            expect(stateVariables["/p"].stateValues.vertices[2]).eqls([-2, 6]);
            expect(stateVariables["/p"].stateValues.draggable).eq(true);
            expect(stateVariables["/p"].stateValues.verticesDraggable).eq(true);
        });

        cy.log("can move all vertices");
        cy.window().then(async (win) => {
            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: [
                        [3, 8],
                        [8, 10],
                        [1, 9],
                    ],
                },
            });
        });

        cy.get(cesc("#\\/pvert") + " .mjx-mrow").should(
            "contain.text",
            "(3,8)",
        );

        cy.get(cesc("#\\/d2")).should("have.text", "true");
        cy.get(cesc("#\\/vd2")).should("have.text", "true");

        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(3,8)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(2)
            .should("have.text", "(8,10)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(4)
            .should("have.text", "(1,9)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/p"].stateValues.vertices[0]).eqls([3, 8]);
            expect(stateVariables["/p"].stateValues.vertices[1]).eqls([8, 10]);
            expect(stateVariables["/p"].stateValues.vertices[2]).eqls([1, 9]);
            expect(stateVariables["/p"].stateValues.draggable).eq(true);
            expect(stateVariables["/p"].stateValues.verticesDraggable).eq(true);
        });

        cy.log("polygon but not vertices draggable");

        cy.get(cesc("#\\/verticesDraggable")).click();
        cy.get(cesc("#\\/vd2")).should("have.text", "false");

        cy.log("cannot move single vertex");
        cy.window().then(async (win) => {
            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: { 2: [9, 3] },
                },
            });
        });

        // wait for core to process click
        cy.get(cesc("#\\/bi")).click();
        cy.get(cesc("#\\/bi2")).should("have.text", "false");

        cy.get(cesc("#\\/d2")).should("have.text", "true");
        cy.get(cesc("#\\/vd2")).should("have.text", "false");

        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(3,8)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(2)
            .should("have.text", "(8,10)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(4)
            .should("have.text", "(1,9)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/p"].stateValues.vertices[0]).eqls([3, 8]);
            expect(stateVariables["/p"].stateValues.vertices[1]).eqls([8, 10]);
            expect(stateVariables["/p"].stateValues.vertices[2]).eqls([1, 9]);
            expect(stateVariables["/p"].stateValues.draggable).eq(true);
            expect(stateVariables["/p"].stateValues.verticesDraggable).eq(
                false,
            );
        });

        cy.log("can move all vertices");
        cy.window().then(async (win) => {
            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: [
                        [-4, 1],
                        [9, -4],
                        [0, 7],
                    ],
                },
            });
        });

        cy.get(cesc("#\\/pvert") + " .mjx-mrow").should(
            "contain.text",
            "(−4,1)",
        );

        cy.get(cesc("#\\/d2")).should("have.text", "true");
        cy.get(cesc("#\\/vd2")).should("have.text", "false");

        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(0)
            .should("have.text", "(−4,1)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(2)
            .should("have.text", "(9,−4)");
        cy.get(cesc("#\\/pvert") + " .mjx-mrow")
            .eq(4)
            .should("have.text", "(0,7)");

        cy.window().then(async (win) => {
            let stateVariables = await win.returnAllStateVariables1();
            expect(stateVariables["/p"].stateValues.vertices[0]).eqls([-4, 1]);
            expect(stateVariables["/p"].stateValues.vertices[1]).eqls([9, -4]);
            expect(stateVariables["/p"].stateValues.vertices[2]).eqls([0, 7]);
            expect(stateVariables["/p"].stateValues.draggable).eq(true);
            expect(stateVariables["/p"].stateValues.verticesDraggable).eq(
                false,
            );
        });
    });

    it("style description changes with theme", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
    <setup>
      <styleDefinitions>
        <styleDefinition styleNumber="1" lineColor="brown" lineColorDarkMode="yellow" fillColor="brown" fillColorDarkMode="yellow" />
        <styleDefinition styleNumber="2" lineColor="#540907" lineColorWord="dark red" lineColorDarkMode="#f0c6c5" lineColorWordDarkMode="light red" fillColor="#540907" fillColorWord="dark red" fillColorDarkMode="#f0c6c5" fillColorWordDarkMode="light red" />
      </styleDefinitions>
    </setup>
    <graph>
      <polygon name="A" styleNumber="1" labelIsName vertices="(0,0) (0,2) (2,0)" filled />
      <polygon name="B" styleNumber="2" labelIsName vertices="(2,2) (2,4) (4,2)" filled />
      <polygon name="C" styleNumber="5" labelIsName vertices="(4,4) (4,6) (6,4)" filled />
    </graph>
    <p name="Adescrip">Polygon A is $A.styleDescription.</p>
    <p name="Bdescrip">B is a $B.styleDescriptionWithNoun.</p>
    <p name="Cdescrip">C is a $C.styleDescriptionWithNoun.</p>
    <p name="Aborderdescrip">A has a $A.borderStyleDescription border.</p>
    <p name="Bborderdescrip">B has a $B.borderStyleDescription border.</p>
    <p name="Cborderdescrip">C has a $C.borderStyleDescription border.</p>
    <p name="Afilldescrip">A has a $A.fillStyleDescription fill.</p>
    <p name="Bfilldescrip">B has a $B.fillStyleDescription fill.</p>
    <p name="Cfilldescrip">C has a $C.fillStyleDescription fill.</p>
    `,
                },
                "*",
            );
        });

        cy.get(cesc("#\\/Adescrip")).should(
            "have.text",
            "Polygon A is filled brown with thick border.",
        );
        cy.get(cesc("#\\/Bdescrip")).should(
            "have.text",
            "B is a filled dark red polygon.",
        );
        cy.get(cesc("#\\/Cdescrip")).should(
            "have.text",
            "C is a filled black polygon with a thin border.",
        );
        cy.get(cesc("#\\/Aborderdescrip")).should(
            "have.text",
            "A has a thick brown border.",
        );
        cy.get(cesc("#\\/Bborderdescrip")).should(
            "have.text",
            "B has a dark red border.",
        );
        cy.get(cesc("#\\/Cborderdescrip")).should(
            "have.text",
            "C has a thin black border.",
        );
        cy.get(cesc("#\\/Afilldescrip")).should(
            "have.text",
            "A has a brown fill.",
        );
        cy.get(cesc("#\\/Bfilldescrip")).should(
            "have.text",
            "B has a dark red fill.",
        );
        cy.get(cesc("#\\/Cfilldescrip")).should(
            "have.text",
            "C has a black fill.",
        );

        cy.log("set dark mode");
        cy.get("#testRunner_toggleControls").click();
        cy.get("#testRunner_darkMode").click();
        cy.wait(100);
        cy.get("#testRunner_toggleControls").click();

        cy.get(cesc("#\\/Adescrip")).should(
            "have.text",
            "Polygon A is filled yellow with thick border.",
        );
        cy.get(cesc("#\\/Bdescrip")).should(
            "have.text",
            "B is a filled light red polygon.",
        );
        cy.get(cesc("#\\/Cdescrip")).should(
            "have.text",
            "C is a filled white polygon with a thin border.",
        );
        cy.get(cesc("#\\/Aborderdescrip")).should(
            "have.text",
            "A has a thick yellow border.",
        );
        cy.get(cesc("#\\/Bborderdescrip")).should(
            "have.text",
            "B has a light red border.",
        );
        cy.get(cesc("#\\/Cborderdescrip")).should(
            "have.text",
            "C has a thin white border.",
        );
        cy.get(cesc("#\\/Afilldescrip")).should(
            "have.text",
            "A has a yellow fill.",
        );
        cy.get(cesc("#\\/Bfilldescrip")).should(
            "have.text",
            "B has a light red fill.",
        );
        cy.get(cesc("#\\/Cfilldescrip")).should(
            "have.text",
            "C has a white fill.",
        );
    });

    it("One vertex constrained to grid", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,5)</point>
    <point>(-4,-1)</point>
    <point>(5,2)
      <constraints>
        <constrainToGrid dx="3" dy="4" />
      </constraints>
    </point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 5],
            [-4, -1],
            [6, 4],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex");
        cy.window().then(async (win) => {
            vertices[1] = [4, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: vertices[1] },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right");
        cy.window().then(async (win) => {
            let moveX = 4;
            let moveY = 3;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            // adjustment due to constraint
            moveX = -1;
            moveY = 1;
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("try to move double copied polygon down and to the right");
        cy.window().then(async (win) => {
            let moveX = 1;
            let moveY = -7;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            // adjustment due to constraint
            moveX = -1;
            moveY = -1;
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Two vertices constrained to same grid", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,5)
      <constraints>
        <constrainToGrid dx="3" dy="4" />
      </constraints>
    </point>
    <point>(-4,-1)</point>
    <point>(5,2)
      <constraints>
        <constrainToGrid dx="3" dy="4" />
      </constraints>
    </point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 4],
            [-4, -1],
            [6, 4],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex");
        cy.window().then(async (win) => {
            vertices[1] = [4, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: vertices[1] },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right");
        cy.window().then(async (win) => {
            let moveX = 4;
            let moveY = 3;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            // adjustment due to constraint
            moveX = -1;
            moveY = 1;
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("try to move double copied polygon down and to the right");
        cy.window().then(async (win) => {
            let moveX = 1;
            let moveY = -7;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            // adjustment due to constraint
            moveX = -1;
            moveY = -1;
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Three vertices constrained to same grid", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,5)
      <constraints>
        <constrainToGrid dx="3" dy="4" />
      </constraints>
    </point>
    <point>(-4,-1)
      <constraints>
        <constrainToGrid dx="3" dy="4" />
      </constraints>
    </point>
    <point>(5,2)
      <constraints>
        <constrainToGrid dx="3" dy="4" />
      </constraints>
    </point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 4],
            [-3, 0],
            [6, 4],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex");
        cy.window().then(async (win) => {
            vertices[1] = [4, 7];

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: vertices[1] },
                },
            });

            // adjust for constraint
            vertices[1] = [3, 8];

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right");
        cy.window().then(async (win) => {
            let moveX = 4;
            let moveY = 3;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            // adjustment due to constraint
            moveX = -1;
            moveY = 1;
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("try to move double copied polygon down and to the right");
        cy.window().then(async (win) => {
            let moveX = 1;
            let moveY = -7;

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: vertices,
                },
            });

            // adjustment due to constraint
            moveX = -1;
            moveY = -1;
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Two vertices fixed, handle rounding error from third calculated vertex", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point fixed>(1,2)</point>
    <point>(-1,-1)</point>
    <point fixed>(5,2)</point>
    <polygon vertices="$_point1 3$_point2 $_point3" name="pg" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3"})

  <booleaninput name="bi"/> <boolean name="bi2" copySource="bi" />
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [1, 2],
            [-3, -3],
            [5, 2],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log(
            "try to move polygon where calculated vertex can't be represented exactly",
        );
        cy.window().then(async (win) => {
            // key point: (desiredVertex2X/3)*3 !== desiredVertex2X due to round off error
            let desiredVertex2X = 0.38823529411764707;
            let desiredVertex2Y = -2.7803926355698527;

            let moveX = desiredVertex2X - vertices[1][0];
            let moveY = desiredVertex2Y - vertices[1][1];

            let desiredVertices = [];

            for (let i = 0; i < vertices.length; i++) {
                if (i === 1) {
                    desiredVertices.push([desiredVertex2X, desiredVertex2Y]);
                } else {
                    desiredVertices.push([
                        vertices[i][0] + moveX,
                        vertices[i][1] + moveY,
                    ]);
                }
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: desiredVertices,
                },
            });

            // since nothing is supposed to happen, click boolean to wait for core
            cy.get(cesc2("#/bi")).click();
            cy.get(cesc2("#/bi2")).should("have.text", "true");

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("handle bad vertices", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
    <text>a</text>
    <graph>
      <polygon vertices="A" />
    </graph>
    `,
                },
                "*",
            );
        });

        // page loads
        cy.get(cesc2("#/_text1")).should("have.text", "a");
    });

    it("area and perimeter", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
    <graph>
      <polygon vertices="(0,0) (5,0) (6,1) (5,2) (0,10)" name="p" />
    </graph>
    <p>Area: <number copySource="p.area" name="area" /></p>
    <p>Perimeter: <number copySource="p.perimeter" name="perimeter" /></p>
    `,
                },
                "*",
            );
        });

        let area = 5 * 2 + 1 + (8 * 5) / 2;
        let perimeter = 5 + 2 * Math.sqrt(2) + Math.sqrt(25 + 64) + 10;

        cy.get(cesc2("#/area")).should("have.text", `${area}`);
        cy.get(cesc2("#/perimeter")).should(
            "have.text",
            `${Math.round(perimeter * 100) / 100}`,
        );

        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: { 1: [-8, -4] },
                },
            });
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: { 2: [-8, 2] },
                },
            });

            area = 2 * 8 + (4 * 8) / 2 - (5 * 8) / 2;
            perimeter = 13 + 6 + Math.sqrt(16 + 64) + 10 + Math.sqrt(25 + 64);

            cy.get(cesc2("#/area")).should("have.text", `${area}`);
            cy.get(cesc2("#/perimeter")).should(
                "have.text",
                `${Math.round(perimeter * 100) / 100}`,
            );
        });

        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: { 3: [8, 2] },
                },
            });

            perimeter = 16 + 6 + Math.sqrt(16 + 64) + 10 + Math.sqrt(64 + 64);

            cy.get(cesc2("#/area")).should("have.text", `0`);
            cy.get(cesc2("#/perimeter")).should(
                "have.text",
                `${Math.round(perimeter * 100) / 100}`,
            );
        });

        cy.window().then(async (win) => {
            win.callAction1({
                actionName: "movePolygon",
                componentName: "/p",
                args: {
                    pointCoords: { 0: [0, 2] },
                },
            });

            area = (8 * 8) / 2 - (8 * 6) / 2;

            perimeter = 16 + 6 + Math.sqrt(36 + 64) + 8 + Math.sqrt(64 + 64);

            cy.get(cesc2("#/area")).should("have.text", `${area}`);
            cy.get(cesc2("#/perimeter")).should(
                "have.text",
                `${Math.round(perimeter * 100) / 100}`,
            );
        });
    });

    it("Rigid polygon", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,7)</point>
    <point>(-4,-1)</point>
    <point>(8,2)</point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" rigid />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
    $pg.vertices{assignNames="v1 v2 v3 v4"}
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 7],
            [-4, -1],
            [8, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex rotates");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 90 degrees counterclockwise around centroid
            // (shrinking by 1/2, but that will be ignored)
            let requested_vertex_1 = [
                -0.5 * (vertices[1][1] - centroid[1]) + centroid[0],
                0.5 * (vertices[1][0] - centroid[0]) + centroid[1],
            ];
            vertices = vertices.map((v) => [
                -(v[1] - centroid[1]) + centroid[0],
                v[0] - centroid[0] + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: requested_vertex_1 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right chooses minimum moved");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            // add extra movement to requested vertices, which will be ignored
            let requested_vertices = [];
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
                requested_vertices.push([
                    vertices[i][0] + i,
                    vertices[i][1] + 2 * i,
                ]);
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: requested_vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move double copied individual vertex, getting rotation");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 180 degrees around centroid
            // (doubling length, but that will be ignored)
            let requested_vertex_2 = [
                -2 * (vertices[2][0] - centroid[0]) + centroid[0],
                -2 * (vertices[2][1] - centroid[1]) + centroid[1],
            ];
            vertices = vertices.map((v) => [
                -(v[0] - centroid[0]) + centroid[0],
                -(v[1] - centroid[1]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: { 2: requested_vertex_2 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving single copied vertex gets rotation");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 90 degrees clockwise around centroid
            // (shrinking by 1/4, but that will be ignored)
            let requested_vertex_3 = [
                0.25 * (vertices[3][1] - centroid[1]) + centroid[0],
                -0.25 * (vertices[3][0] - centroid[0]) + centroid[1],
            ];
            vertices = vertices.map((v) => [
                v[1] - centroid[1] + centroid[0],
                -(v[0] - centroid[0]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g2/v4",
                args: { x: requested_vertex_3[0], y: requested_vertex_3[1] },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving defining vertex deforms polygon");
        cy.window().then(async (win) => {
            vertices[0] = [4, 6];

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/_point1",
                args: { x: vertices[0][0], y: vertices[0][1] },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    //     it("Rigid polygon, vertex constraint", () => {
    //         cy.window().then(async (win) => {
    //             win.postMessage(
    //                 {
    //                     doenetML: `
    //   <text>a</text>
    //   <graph name="g1" newNamespace>
    //     <point>(3,7)</point>
    //     <point>(-4,-1)</point>
    //     <point>(8,2)</point>
    //     <point>(-3,4)</point>

    //     <point styleNumber="2" name="a1">(1,9)</point>
    //     <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" rigid >
    //         <vertexConstraints>
    //             <attractTo threshold="2">$a1</attractTo>
    //         </vertexConstraints>
    //     </polygon>
    //   </graph>
    //   <graph name="g2" newNamespace>
    //     $(../g1/pg{name="pg"})
    //   </graph>
    //   $g2{name="g3"}
    //   $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
    //   `,
    //                 },
    //                 "*",
    //             );
    //         });
    //         cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

    //         let vertices = [
    //             [3, 7],
    //             [-4, -1],
    //             [8, 2],
    //             [-3, 4],
    //         ];

    //         let centroid = vertices.reduce(
    //             (a, c) => [a[0] + c[0], a[1] + c[1]],
    //             [0, 0],
    //         );
    //         centroid[0] /= 4;
    //         centroid[1] /= 4;

    //         testPolygonCopiedTwice({ vertices });

    //         cy.log("move individual vertex rotates, attracts to point");
    //         cy.window().then(async (win) => {
    //             // rotate by 90 degrees counterclockwise around centroid
    //             // (shrinking by 1/2, but that will be ignored)
    //             let requested_vertex_1 = [
    //                 -0.5 * (vertices[1][1] - centroid[1]) + centroid[0],
    //                 0.5 * (vertices[1][0] - centroid[0]) + centroid[1],
    //             ];
    //             vertices = vertices.map((v) => [
    //                 -(v[1] - centroid[1]) + centroid[0],
    //                 v[0] - centroid[0] + centroid[1],
    //             ]);
    //             // since attracted to point, moves down one and to the left
    //             vertices = vertices.map((v) => [v[0] - 1, v[1] - 1]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g1/pg",
    //                 args: {
    //                     pointCoords: { 1: requested_vertex_1 },
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log("rotating further so no attraction preserves old centroid");
    //         cy.window().then(async (win) => {
    //             // location of vertices if weren't attracted to point, moves up one and to the right
    //             vertices = vertices.map((v) => [v[0] + 1, v[1] + 1]);

    //             // rotate by another 90 degrees counterclockwise around centroid
    //             // (doubling but that will be ignored)
    //             let requested_vertex_1 = [
    //                 -2 * (vertices[1][1] - centroid[1]) + centroid[0],
    //                 2 * (vertices[1][0] - centroid[0]) + centroid[1],
    //             ];
    //             vertices = vertices.map((v) => [
    //                 -(v[1] - centroid[1]) + centroid[0],
    //                 v[0] - centroid[0] + centroid[1],
    //             ]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g1/pg",
    //                 args: {
    //                     pointCoords: { 1: requested_vertex_1 },
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log(
    //             "move copied polygon up and to the left chooses minimum moved and gets attracted",
    //         );
    //         cy.window().then(async (win) => {
    //             let moveX = -4;
    //             let moveY = 1;

    //             // add extra movement to requested vertices, which will be ignored
    //             let requested_vertices = [];
    //             for (let i = 0; i < vertices.length; i++) {
    //                 vertices[i][0] = vertices[i][0] + moveX;
    //                 vertices[i][1] = vertices[i][1] + moveY;
    //                 requested_vertices.push([
    //                     vertices[i][0] - i,
    //                     vertices[i][1] + 2 * i,
    //                 ]);
    //             }

    //             // since attracted to point, moves up one and to the left
    //             vertices = vertices.map((v) => [v[0] - 1, v[1] + 1]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g2/pg",
    //                 args: {
    //                     pointCoords: requested_vertices,
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log(
    //             "move double copied individual vertex, getting rotation around new centroid",
    //         );
    //         cy.window().then(async (win) => {
    //             let centroid = vertices.reduce(
    //                 (a, c) => [a[0] + c[0], a[1] + c[1]],
    //                 [0, 0],
    //             );
    //             centroid[0] /= 4;
    //             centroid[1] /= 4;

    //             // rotate by 180 degrees around centroid
    //             // (doubling length, but that will be ignored)
    //             let requested_vertex_2 = [
    //                 -2 * (vertices[2][0] - centroid[0]) + centroid[0],
    //                 -2 * (vertices[2][1] - centroid[1]) + centroid[1],
    //             ];
    //             vertices = vertices.map((v) => [
    //                 -(v[0] - centroid[0]) + centroid[0],
    //                 -(v[1] - centroid[1]) + centroid[1],
    //             ]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g3/pg",
    //                 args: {
    //                     pointCoords: { 2: requested_vertex_2 },
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });
    //     });

    //     it("Rigid polygon, three vertex constraints", () => {
    //         cy.window().then(async (win) => {
    //             win.postMessage(
    //                 {
    //                     doenetML: `
    //   <text>a</text>
    //   <graph name="g1" newNamespace>
    //     <point>(3,7)</point>
    //     <point>(-4,-1)</point>
    //     <point>(8,2)</point>
    //     <point>(-3,4)</point>

    //     <point styleNumber="2" name="a1">(1,9)</point>
    //     <point styleNumber="2" name="a2">(5,-1)</point>
    //     <point styleNumber="2" name="a3">(-9,5)</point>
    //     <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" rigid >
    //     <vertexConstraints>
    //       <attractTo threshold="2">$a1$a2$a3</attractTo>
    //     </vertexConstraints>
    //     </polygon>
    //   </graph>
    //   <graph name="g2" newNamespace>
    //     $(../g1/pg{name="pg"})
    //   </graph>
    //   $g2{name="g3"}
    //   $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
    //   `,
    //                 },
    //                 "*",
    //             );
    //         });
    //         cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

    //         let vertices = [
    //             [3, 7],
    //             [-4, -1],
    //             [8, 2],
    //             [-3, 4],
    //         ];

    //         let centroid = vertices.reduce(
    //             (a, c) => [a[0] + c[0], a[1] + c[1]],
    //             [0, 0],
    //         );
    //         centroid[0] /= 4;
    //         centroid[1] /= 4;

    //         testPolygonCopiedTwice({ vertices });

    //         cy.log("move individual vertex rotates, attracts to closest point");
    //         cy.window().then(async (win) => {
    //             // rotate by 90 degrees counterclockwise around centroid
    //             // (shrinking by 1/2, but that will be ignored)
    //             let requested_vertex_1 = [
    //                 -0.5 * (vertices[1][1] - centroid[1]) + centroid[0],
    //                 0.5 * (vertices[1][0] - centroid[0]) + centroid[1],
    //             ];
    //             vertices = vertices.map((v) => [
    //                 -(v[1] - centroid[1]) + centroid[0],
    //                 v[0] - centroid[0] + centroid[1],
    //             ]);
    //             // since attracted to closest point (5,-2), moves up one
    //             vertices = vertices.map((v) => [v[0], v[1] + 1]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g1/pg",
    //                 args: {
    //                     pointCoords: { 1: requested_vertex_1 },
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log("rotating further so no attraction preserves old centroid");
    //         cy.window().then(async (win) => {
    //             // location of vertices if weren't attracted to point, moves down one
    //             vertices = vertices.map((v) => [v[0], v[1] - 1]);

    //             // rotate by another 90 degrees counterclockwise around centroid
    //             // (doubling but that will be ignored)
    //             let requested_vertex_1 = [
    //                 -2 * (vertices[1][1] - centroid[1]) + centroid[0],
    //                 2 * (vertices[1][0] - centroid[0]) + centroid[1],
    //             ];
    //             vertices = vertices.map((v) => [
    //                 -(v[1] - centroid[1]) + centroid[0],
    //                 v[0] - centroid[0] + centroid[1],
    //             ]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g1/pg",
    //                 args: {
    //                     pointCoords: { 1: requested_vertex_1 },
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log(
    //             "move copied polygon up and to the left chooses minimum moved and gets attracted",
    //         );
    //         cy.window().then(async (win) => {
    //             let moveX = -4;
    //             let moveY = 1;

    //             // add extra movement to requested vertices, which will be ignored
    //             let requested_vertices = [];
    //             for (let i = 0; i < vertices.length; i++) {
    //                 vertices[i][0] = vertices[i][0] + moveX;
    //                 vertices[i][1] = vertices[i][1] + moveY;
    //                 requested_vertices.push([
    //                     vertices[i][0] - i,
    //                     vertices[i][1] + 2 * i,
    //                 ]);
    //             }

    //             // since attracted to point (-9,5), moves one to the right
    //             vertices = vertices.map((v) => [v[0] + 1, v[1]]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g2/pg",
    //                 args: {
    //                     pointCoords: requested_vertices,
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log(
    //             "move double copied individual vertex, getting rotation around new centroid, then attracted to point",
    //         );
    //         cy.window().then(async (win) => {
    //             let centroid = vertices.reduce(
    //                 (a, c) => [a[0] + c[0], a[1] + c[1]],
    //                 [0, 0],
    //             );
    //             centroid[0] /= 4;
    //             centroid[1] /= 4;

    //             // rotate by 180 degrees around centroid
    //             // (doubling length, but that will be ignored)
    //             let requested_vertex_2 = [
    //                 -2 * (vertices[2][0] - centroid[0]) + centroid[0],
    //                 -2 * (vertices[2][1] - centroid[1]) + centroid[1],
    //             ];
    //             vertices = vertices.map((v) => [
    //                 -(v[0] - centroid[0]) + centroid[0],
    //                 -(v[1] - centroid[1]) + centroid[1],
    //             ]);

    //             // since a different vertex is attracted to point (1,9), moves one up and to the right
    //             vertices = vertices.map((v) => [v[0] + 1, v[1] + 1]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g3/pg",
    //                 args: {
    //                     pointCoords: { 2: requested_vertex_2 },
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });
    //     });

    //     it("Non-rigid polygon, three vertex constraints", () => {
    //         cy.window().then(async (win) => {
    //             win.postMessage(
    //                 {
    //                     doenetML: `
    // <text>a</text>
    // <graph name="g1" newNamespace>
    //   <point>(3,7)</point>
    //   <point>(-4,-1)</point>
    //   <point>(8,2)</point>
    //   <point>(-3,4)</point>

    //   <point styleNumber="2" name="a1">(1,9)</point>
    //   <point styleNumber="2" name="a2">(5,-1)</point>
    //   <point styleNumber="2" name="a3">(-9,5)</point>
    //   <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" >
    //   <vertexConstraints>
    //     <attractTo threshold="2">$a1$a2$a3</attractTo>
    //   </vertexConstraints>
    //   </polygon>
    // </graph>
    // <graph name="g2" newNamespace>
    //   $(../g1/pg{name="pg"})
    //   $pg.vertices{assignNames="v1 v2 v3 v4"}
    // </graph>
    // $g2{name="g3"}
    // $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
    // `,
    //                 },
    //                 "*",
    //             );
    //         });
    //         cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

    //         let vertices = [
    //             [3, 7],
    //             [-4, -1],
    //             [8, 2],
    //             [-3, 4],
    //         ];

    //         testPolygonCopiedTwice({ vertices });

    //         cy.log("move individual vertex, attracts to closest point");
    //         cy.window().then(async (win) => {
    //             let requested_vertex_1 = [-10, 6];

    //             vertices[1] = [-9, 5];
    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g1/pg",
    //                 args: {
    //                     pointCoords: { 1: requested_vertex_1 },
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log("Moving entire polygon up attract to another point");

    //         cy.window().then(async (win) => {
    //             let moveX = -1;
    //             let moveY = 1;

    //             let requested_vertices = [];
    //             for (let i = 0; i < vertices.length; i++) {
    //                 vertices[i][0] = vertices[i][0] + moveX;
    //                 vertices[i][1] = vertices[i][1] + moveY;
    //                 requested_vertices.push([vertices[i][0], vertices[i][1]]);
    //             }

    //             // since attracted to point (1,9), moves one up and to the left
    //             vertices = vertices.map((v) => [v[0] - 1, v[1] + 1]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g2/pg",
    //                 args: {
    //                     pointCoords: requested_vertices,
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log("move double copied individual vertex");
    //         cy.window().then(async (win) => {
    //             vertices[2] = [2, 1];

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g3/pg",
    //                 args: {
    //                     pointCoords: { 2: vertices[2] },
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log("Moving entire polygon near two points, attracts to just one");
    //         cy.window().then(async (win) => {
    //             let moveX = 2.6;
    //             let moveY = -2;

    //             let requested_vertices = [];
    //             for (let i = 0; i < vertices.length; i++) {
    //                 vertices[i][0] = vertices[i][0] + moveX;
    //                 vertices[i][1] = vertices[i][1] + moveY;
    //                 requested_vertices.push([vertices[i][0], vertices[i][1]]);
    //             }

    //             // since attracted to point (5,-1), moves 0.4 to the right
    //             vertices = vertices.map((v) => [v[0] + 0.4, v[1]]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g2/pg",
    //                 args: {
    //                     pointCoords: requested_vertices,
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log(
    //             "Moving just one vertex attracts to other nearby vertex to attractor",
    //         );
    //         cy.window().then(async (win) => {
    //             let requested_vertex_0 = [0, 10];
    //             vertices[0] = [1, 9];
    //             vertices[1] = [-9, 5];

    //             win.callAction1({
    //                 actionName: "movePoint",
    //                 componentName: "/g2/v1",
    //                 args: { x: requested_vertex_0[0], y: requested_vertex_0[1] },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });
    //     });

    //     it("Rigid polygon, vertices attracted to polygon", () => {
    //         cy.window().then(async (win) => {
    //             win.postMessage(
    //                 {
    //                     doenetML: `
    //   <text>a</text>
    //   <graph name="g1" newNamespace>
    //     <polygon name="pa" vertices="(0,0) (12,0) (6,9)" stylenumber="2" />

    //     <point name="v1">(-1,0)</point>
    //     <point name="v2">(3,0)</point>
    //     <point name="v3">(1,-3)</point>
    //     <polygon name="pg" vertices="$v1 $v2 $v3" rigid layer="2">
    //        <vertexConstraints>
    //          <attractTo threshold="2">$pa</attractTo>
    //       </vertexConstraints>
    //     </polygon>
    //   </graph>
    //   <graph name="g2" newNamespace>
    //     $(../g1/pg{name="pg"})
    //   </graph>
    //   $g2{name="g3"}
    //   $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
    //   `,
    //                 },
    //                 "*",
    //             );
    //         });
    //         cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

    //         cy.log("start shifted so that two vertices are attracted");

    //         let vertices = [
    //             [0, 0],
    //             [4, 0],
    //             [2, -3],
    //         ];

    //         testPolygonCopiedTwice({ vertices });

    //         cy.log("move individual vertex rotates, attracts to edge of polygon");

    //         let centroid = vertices.reduce(
    //             (a, c) => [a[0] + c[0], a[1] + c[1]],
    //             [0, 0],
    //         );
    //         centroid[0] /= 3;
    //         centroid[1] /= 3;

    //         cy.window().then(async (win) => {
    //             // shift 1 to left to give original before attraction
    //             centroid[0] -= 1;
    //             vertices = vertices.map((v) => [v[0] - 1, v[1]]);

    //             // rotate by 90 degrees clockwise around centroid
    //             // (shrinking by 1/2, but that will be ignored)
    //             let requested_vertex_1 = [
    //                 0.5 * (vertices[1][1] - centroid[1]) + centroid[0],
    //                 -0.5 * (vertices[1][0] - centroid[0]) + centroid[1],
    //             ];
    //             vertices = vertices.map((v) => [
    //                 v[1] - centroid[1] + centroid[0],
    //                 -(v[0] - centroid[0]) + centroid[1],
    //             ]);
    //             // since attracted to edge, moves down one and to the left
    //             vertices = vertices.map((v) => [v[0], v[1] - 1]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g1/pg",
    //                 args: {
    //                     pointCoords: { 1: requested_vertex_1 },
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log("move copied polygon up and to the right");
    //         cy.window().then(async (win) => {
    //             // Move so that bottom right gets attracted to (4,6).
    //             // Slope of orthogonal to attractor edge is -6/9.
    //             // So move bottom right to (4,6) + (9,-6)/10

    //             let requested_bottom_right = [4 + 0.9, 6 - 0.6];
    //             let actual_bottom_right = [4, 6];

    //             let moveX = requested_bottom_right[0] - vertices[1][0];
    //             let moveY = requested_bottom_right[1] - vertices[1][1];

    //             // add extra movement to requested vertices, which will be ignored
    //             let requested_vertices = [];
    //             for (let i = 0; i < vertices.length; i++) {
    //                 vertices[i][0] = vertices[i][0] + moveX;
    //                 vertices[i][1] = vertices[i][1] + moveY;
    //                 requested_vertices.push([
    //                     vertices[i][0] + i,
    //                     vertices[i][1] + 2 * i,
    //                 ]);
    //             }

    //             // since attracted to point, moves up one and to the left
    //             vertices = vertices.map((v) => [
    //                 v[0] + actual_bottom_right[0] - requested_bottom_right[0],
    //                 v[1] + actual_bottom_right[1] - requested_bottom_right[1],
    //             ]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g2/pg",
    //                 args: {
    //                     pointCoords: requested_vertices,
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });
    //     });

    //     it("Rigid polygon, vertices attracted to polyline", () => {
    //         cy.window().then(async (win) => {
    //             win.postMessage(
    //                 {
    //                     doenetML: `
    //   <text>a</text>
    //   <graph name="g1" newNamespace>
    //     <polyline name="pa" vertices="(0,0) (12,0) (6,9)" stylenumber="2" />

    //     <point name="v1">(-1,0)</point>
    //     <point name="v2">(3,0)</point>
    //     <point name="v3">(1,-3)</point>
    //     <polygon name="pg" vertices="$v1 $v2 $v3" rigid layer="2">
    //        <vertexConstraints>
    //          <attractTo threshold="2">$pa</attractTo>
    //       </vertexConstraints>
    //     </polygon>
    //   </graph>
    //   <graph name="g2" newNamespace>
    //     $(../g1/pg{name="pg"})
    //   </graph>
    //   $g2{name="g3"}
    //   $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
    //   `,
    //                 },
    //                 "*",
    //             );
    //         });
    //         cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

    //         cy.log("start shifted so that two vertices are attracted");

    //         let vertices = [
    //             [0, 0],
    //             [4, 0],
    //             [2, -3],
    //         ];

    //         testPolygonCopiedTwice({ vertices });

    //         cy.log("move individual vertex rotates, attracts to edge of polygon");

    //         let centroid = vertices.reduce(
    //             (a, c) => [a[0] + c[0], a[1] + c[1]],
    //             [0, 0],
    //         );
    //         centroid[0] /= 3;
    //         centroid[1] /= 3;

    //         cy.window().then(async (win) => {
    //             // shift 1 to left to give original before attraction
    //             centroid[0] -= 1;
    //             vertices = vertices.map((v) => [v[0] - 1, v[1]]);

    //             // rotate by 90 degrees clockwise around centroid
    //             // (shrinking by 1/2, but that will be ignored)
    //             let requested_vertex_1 = [
    //                 0.5 * (vertices[1][1] - centroid[1]) + centroid[0],
    //                 -0.5 * (vertices[1][0] - centroid[0]) + centroid[1],
    //             ];
    //             vertices = vertices.map((v) => [
    //                 v[1] - centroid[1] + centroid[0],
    //                 -(v[0] - centroid[0]) + centroid[1],
    //             ]);
    //             // since attracted to edge, moves down one and to the left
    //             vertices = vertices.map((v) => [v[0], v[1] - 1]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g1/pg",
    //                 args: {
    //                     pointCoords: { 1: requested_vertex_1 },
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });

    //         cy.log("move copied polygon up and to the right");
    //         cy.window().then(async (win) => {
    //             // Move so that bottom right would get attracted to (4,6) if it where a polygon.
    //             // But since it is a polyline, that edge doesn't exist
    //             // and instead the upper right gets attracted to other edge.

    //             // If had polygon,
    //             // slope of orthogonal to attractor edge would be -6/9.
    //             // So move bottom right to (4,6) + (9,-6)/10

    //             let requested_bottom_right = [4 + 0.9, 6 - 0.6];
    //             let actual_bottom_right = [6, 5];

    //             let moveX = requested_bottom_right[0] - vertices[1][0];
    //             let moveY = requested_bottom_right[1] - vertices[1][1];

    //             // add extra movement to requested vertices, which will be ignored
    //             let requested_vertices = [];
    //             for (let i = 0; i < vertices.length; i++) {
    //                 vertices[i][0] = vertices[i][0] + moveX;
    //                 vertices[i][1] = vertices[i][1] + moveY;
    //                 requested_vertices.push([
    //                     vertices[i][0] + i,
    //                     vertices[i][1] + 2 * i,
    //                 ]);
    //             }

    //             // since attracted to point, moves up one and to the left
    //             vertices = vertices.map((v) => [
    //                 v[0] + actual_bottom_right[0] - requested_bottom_right[0],
    //                 v[1] + actual_bottom_right[1] - requested_bottom_right[1],
    //             ]);

    //             win.callAction1({
    //                 actionName: "movePolygon",
    //                 componentName: "/g2/pg",
    //                 args: {
    //                     pointCoords: requested_vertices,
    //                 },
    //             });

    //             testPolygonCopiedTwice({ vertices });
    //         });
    //     });

    it("Preserve similarity", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,7)</point>
    <point>(-4,-1)</point>
    <point>(8,2)</point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" preserveSimilarity />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
    $pg.vertices{assignNames="v1 v2 v3 v4"}
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 7],
            [-4, -1],
            [8, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex rotates and dilates");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 90 degrees counterclockwise around centroid
            // and shrinking by 1/2
            let requested_vertex_1 = [
                -0.5 * (vertices[1][1] - centroid[1]) + centroid[0],
                0.5 * (vertices[1][0] - centroid[0]) + centroid[1],
            ];
            vertices = vertices.map((v) => [
                -0.5 * (v[1] - centroid[1]) + centroid[0],
                0.5 * (v[0] - centroid[0]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: requested_vertex_1 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right chooses minimum moved");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            // add extra movement to requested vertices, which will be ignored
            let requested_vertices = [];
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
                requested_vertices.push([
                    vertices[i][0] + i,
                    vertices[i][1] + 2 * i,
                ]);
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: requested_vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log(
            "move double copied individual vertex, getting rotation and dilation",
        );
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 180 degrees around centroid
            // and doubling length
            let requested_vertex_2 = [
                -2 * (vertices[2][0] - centroid[0]) + centroid[0],
                -2 * (vertices[2][1] - centroid[1]) + centroid[1],
            ];
            vertices = vertices.map((v) => [
                -2 * (v[0] - centroid[0]) + centroid[0],
                -2 * (v[1] - centroid[1]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: { 2: requested_vertex_2 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving single copied vertex gets rotation and dilation");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 90 degrees clockwise around centroid
            // and shrinking by 1/4
            let requested_vertex_3 = [
                0.25 * (vertices[3][1] - centroid[1]) + centroid[0],
                -0.25 * (vertices[3][0] - centroid[0]) + centroid[1],
            ];
            vertices = vertices.map((v) => [
                0.25 * (v[1] - centroid[1]) + centroid[0],
                -0.25 * (v[0] - centroid[0]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g2/v4",
                args: { x: requested_vertex_3[0], y: requested_vertex_3[1] },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving defining vertex deforms polygon");
        cy.window().then(async (win) => {
            vertices[0] = [4, 6];

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/_point1",
                args: { x: vertices[0][0], y: vertices[0][1] },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Preserve similarity and don't allow dilation equals rigid", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,7)</point>
    <point>(-4,-1)</point>
    <point>(8,2)</point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" preserveSimilarity allowDilation="false" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
    $pg.vertices{assignNames="v1 v2 v3 v4"}
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 7],
            [-4, -1],
            [8, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex rotates");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 90 degrees counterclockwise around centroid
            // (shrinking by 1/2, but that will be ignored)
            let requested_vertex_1 = [
                -0.5 * (vertices[1][1] - centroid[1]) + centroid[0],
                0.5 * (vertices[1][0] - centroid[0]) + centroid[1],
            ];
            vertices = vertices.map((v) => [
                -(v[1] - centroid[1]) + centroid[0],
                v[0] - centroid[0] + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: requested_vertex_1 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right chooses minimum moved");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            // add extra movement to requested vertices, which will be ignored
            let requested_vertices = [];
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
                requested_vertices.push([
                    vertices[i][0] + i,
                    vertices[i][1] + 2 * i,
                ]);
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: requested_vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Rigid supersedes setting preserveSimilarity to false or allowDilation to true", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,7)</point>
    <point>(-4,-1)</point>
    <point>(8,2)</point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" preserveSimilarity="false" rigid allowDilation="true" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
    $pg.vertices{assignNames="v1 v2 v3 v4"}
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 7],
            [-4, -1],
            [8, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex rotates");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 90 degrees counterclockwise around centroid
            // (shrinking by 1/2, but that will be ignored)
            let requested_vertex_1 = [
                -0.5 * (vertices[1][1] - centroid[1]) + centroid[0],
                0.5 * (vertices[1][0] - centroid[0]) + centroid[1],
            ];
            vertices = vertices.map((v) => [
                -(v[1] - centroid[1]) + centroid[0],
                v[0] - centroid[0] + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: requested_vertex_1 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right chooses minimum moved");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            // add extra movement to requested vertices, which will be ignored
            let requested_vertices = [];
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
                requested_vertices.push([
                    vertices[i][0] + i,
                    vertices[i][1] + 2 * i,
                ]);
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: requested_vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Don't allow rotation", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,7)</point>
    <point>(-4,-1)</point>
    <point>(8,2)</point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" preserveSimilarity allowRotation="false" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
    $pg.vertices{assignNames="v1 v2 v3 v4"}
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4" displayDigits="6"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 7],
            [-4, -1],
            [8, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex only dilates");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // shrink to half size by moving vertex so projects to half
            // on the segment from centroid to original vertex
            let midpoint = [
                (centroid[0] + vertices[1][0]) / 2,
                (centroid[1] + vertices[1][1]) / 2,
            ];
            let vector_to_v1 = [
                vertices[1][0] - centroid[0],
                vertices[1][1] - centroid[1],
            ];
            let rotate_vector = [-3 * vector_to_v1[1], 3 * vector_to_v1[0]];

            let requested_vertex_1 = [
                midpoint[0] + rotate_vector[0],
                midpoint[1] + rotate_vector[1],
            ];
            vertices = vertices.map((v) => [
                0.5 * (v[0] - centroid[0]) + centroid[0],
                0.5 * (v[1] - centroid[1]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: requested_vertex_1 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right chooses minimum moved");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            // add extra movement to requested vertices, which will be ignored
            let requested_vertices = [];
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
                requested_vertices.push([
                    vertices[i][0] + i,
                    vertices[i][1] + 2 * i,
                ]);
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: requested_vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log(
            "move double copied individual vertex, attempting to rotation 90 degrees shrinks to minimum",
        );
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // attempt to rotate by 90 degrees around centroid
            let requested_vertex_2 = [
                2 * (vertices[2][1] - centroid[1]) + centroid[0],
                -2 * (vertices[2][0] - centroid[0]) + centroid[1],
            ];

            // distance from vertex 2 and centroid becomes minShrink = 0.1
            let shrink_factor =
                0.1 /
                Math.sqrt(
                    (vertices[2][1] - centroid[1]) ** 2 +
                        (vertices[2][0] - centroid[0]) ** 2,
                );

            vertices = vertices.map((v) => [
                shrink_factor * (v[0] - centroid[0]) + centroid[0],
                shrink_factor * (v[1] - centroid[1]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: { 2: requested_vertex_2 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving single copied vertex to dilate");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // Make 10 times larger by moving vertex so projects to 10 times the length on
            // on the segment from centroid to original vertex
            let extended_point = [
                10 * vertices[3][0] - 9 * centroid[0],
                10 * vertices[3][1] - 9 * centroid[1],
            ];
            let vector_to_v3 = [
                vertices[3][0] - centroid[0],
                vertices[3][1] - centroid[1],
            ];
            let rotate_vector = [0.5 * vector_to_v3[1], -0.5 * vector_to_v3[0]];

            let requested_vertex_3 = [
                extended_point[0] + rotate_vector[0],
                extended_point[1] + rotate_vector[1],
            ];
            vertices = vertices.map((v) => [
                10 * (v[0] - centroid[0]) + centroid[0],
                10 * (v[1] - centroid[1]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g2/v4",
                args: { x: requested_vertex_3[0], y: requested_vertex_3[1] },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving defining vertex deforms polygon");
        cy.window().then(async (win) => {
            vertices[0] = [4, 6];

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/_point1",
                args: { x: vertices[0][0], y: vertices[0][1] },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Don't allow rotation, large minShrink", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,7)</point>
    <point>(-4,-1)</point>
    <point>(8,2)</point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" preserveSimilarity allowRotation="false" minShrink="2" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
    $pg.vertices{assignNames="v1 v2 v3 v4"}
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4" displayDigits="8"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 7],
            [-4, -1],
            [8, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex only dilates");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // shrink to half size by moving vertex so projects to half
            // on the segment from centroid to original vertex
            let midpoint = [
                (centroid[0] + vertices[1][0]) / 2,
                (centroid[1] + vertices[1][1]) / 2,
            ];
            let vector_to_v1 = [
                vertices[1][0] - centroid[0],
                vertices[1][1] - centroid[1],
            ];
            let rotate_vector = [-3 * vector_to_v1[1], 3 * vector_to_v1[0]];

            let requested_vertex_1 = [
                midpoint[0] + rotate_vector[0],
                midpoint[1] + rotate_vector[1],
            ];
            vertices = vertices.map((v) => [
                0.5 * (v[0] - centroid[0]) + centroid[0],
                0.5 * (v[1] - centroid[1]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: requested_vertex_1 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right chooses minimum moved");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            // add extra movement to requested vertices, which will be ignored
            let requested_vertices = [];
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
                requested_vertices.push([
                    vertices[i][0] + i,
                    vertices[i][1] + 2 * i,
                ]);
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: requested_vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log(
            "move double copied individual vertex, attempting to rotation 90 degrees shrinks to minimum",
        );
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // attempt to rotate by 90 degrees around centroid
            let requested_vertex_2 = [
                2 * (vertices[2][1] - centroid[1]) + centroid[0],
                -2 * (vertices[2][0] - centroid[0]) + centroid[1],
            ];

            // distance from vertex 2 and centroid becomes minShrink = 0.1
            let shrink_factor =
                2 /
                Math.sqrt(
                    (vertices[2][1] - centroid[1]) ** 2 +
                        (vertices[2][0] - centroid[0]) ** 2,
                );

            vertices = vertices.map((v) => [
                shrink_factor * (v[0] - centroid[0]) + centroid[0],
                shrink_factor * (v[1] - centroid[1]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: { 2: requested_vertex_2 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving single copied vertex to dilate");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // Make 10 times larger by moving vertex so projects to 10 times the length on
            // on the segment from centroid to original vertex
            let extended_point = [
                10 * vertices[3][0] - 9 * centroid[0],
                10 * vertices[3][1] - 9 * centroid[1],
            ];
            let vector_to_v3 = [
                vertices[3][0] - centroid[0],
                vertices[3][1] - centroid[1],
            ];
            let rotate_vector = [0.5 * vector_to_v3[1], -0.5 * vector_to_v3[0]];

            let requested_vertex_3 = [
                extended_point[0] + rotate_vector[0],
                extended_point[1] + rotate_vector[1],
            ];
            vertices = vertices.map((v) => [
                10 * (v[0] - centroid[0]) + centroid[0],
                10 * (v[1] - centroid[1]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g2/v4",
                args: { x: requested_vertex_3[0], y: requested_vertex_3[1] },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving defining vertex deforms polygon");
        cy.window().then(async (win) => {
            vertices[0] = [4, 6];

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/_point1",
                args: { x: vertices[0][0], y: vertices[0][1] },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Don't allow translation", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,7)</point>
    <point>(-4,-1)</point>
    <point>(8,2)</point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" preserveSimilarity allowTranslation="false" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
    $pg.vertices{assignNames="v1 v2 v3 v4"}
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 7],
            [-4, -1],
            [8, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex rotates and dilates");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 90 degrees counterclockwise around centroid
            // and shrinking by 1/2
            let requested_vertex_1 = [
                -0.5 * (vertices[1][1] - centroid[1]) + centroid[0],
                0.5 * (vertices[1][0] - centroid[0]) + centroid[1],
            ];
            vertices = vertices.map((v) => [
                -0.5 * (v[1] - centroid[1]) + centroid[0],
                0.5 * (v[0] - centroid[0]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: requested_vertex_1 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up does not move");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            // this translation will be ignored
            let requested_vertices = [];
            for (let i = 0; i < vertices.length; i++) {
                requested_vertices.push([
                    vertices[i][0] + moveX,
                    vertices[i][1] + moveY,
                ]);
            }

            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: requested_vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log(
            "move double copied individual vertex, getting rotation and dilation",
        );
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 180 degrees around centroid
            // and doubling length
            let requested_vertex_2 = [
                -2 * (vertices[2][0] - centroid[0]) + centroid[0],
                -2 * (vertices[2][1] - centroid[1]) + centroid[1],
            ];
            vertices = vertices.map((v) => [
                -2 * (v[0] - centroid[0]) + centroid[0],
                -2 * (v[1] - centroid[1]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: { 2: requested_vertex_2 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving single copied vertex gets rotation and dilation");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 90 degrees clockwise around centroid
            // and shrinking by 1/4
            let requested_vertex_3 = [
                0.25 * (vertices[3][1] - centroid[1]) + centroid[0],
                -0.25 * (vertices[3][0] - centroid[0]) + centroid[1],
            ];
            vertices = vertices.map((v) => [
                0.25 * (v[1] - centroid[1]) + centroid[0],
                -0.25 * (v[0] - centroid[0]) + centroid[1],
            ]);

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g2/v4",
                args: { x: requested_vertex_3[0], y: requested_vertex_3[1] },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving defining vertex deforms polygon");
        cy.window().then(async (win) => {
            vertices[0] = [4, 6];

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/_point1",
                args: { x: vertices[0][0], y: vertices[0][1] },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Only translation", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,7)</point>
    <point>(-4,-1)</point>
    <point>(8,2)</point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" preserveSimilarity allowRotation="false" allowDilation="false" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
    $pg.vertices{assignNames="v1 v2 v3 v4"}
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 7],
            [-4, -1],
            [8, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex translates");
        cy.window().then(async (win) => {
            let moveX = -1;
            let moveY = -3;
            let requested_vertex_1 = [
                vertices[1][0] + moveX,
                vertices[1][1] + moveY,
            ];

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: requested_vertex_1 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to right");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            // add extra movement to requested vertices, which will be ignored
            let requested_vertices = [];
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
                requested_vertices.push([
                    vertices[i][0] + i,
                    vertices[i][1] + 2 * i,
                ]);
            }

            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: requested_vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move double copied individual vertex, getting translation");
        cy.window().then(async (win) => {
            let moveX = -8;
            let moveY = 4;
            let requested_vertex_2 = [
                vertices[2][0] + moveX,
                vertices[2][1] + moveY,
            ];

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: { 2: requested_vertex_2 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving single copied vertex gets translation");
        cy.window().then(async (win) => {
            let moveX = 2;
            let moveY = -5;
            let requested_vertex_3 = [
                vertices[3][0] + moveX,
                vertices[3][1] + moveY,
            ];

            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
            }

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g2/v4",
                args: { x: requested_vertex_3[0], y: requested_vertex_3[1] },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving defining vertex deforms polygon");
        cy.window().then(async (win) => {
            vertices[0] = [4, 6];

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/_point1",
                args: { x: vertices[0][0], y: vertices[0][1] },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Don't allow any transformations", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,7)</point>
    <point>(-4,-1)</point>
    <point>(8,2)</point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" preserveSimilarity allowTranslation="false" allowRotation="false" allowDilation="false" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
    $pg.vertices{assignNames="v1 v2 v3 v4"}
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 7],
            [-4, -1],
            [8, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex doesn't move");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 90 degrees counterclockwise around centroid
            // and shrinking by 1/2
            // but no effect
            let requested_vertex_1 = [
                -0.5 * (vertices[1][1] - centroid[1]) + centroid[0],
                0.5 * (vertices[1][0] - centroid[0]) + centroid[1],
            ];

            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 1: requested_vertex_1 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up does not move");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            // this translation will be ignored
            let requested_vertices = [];
            for (let i = 0; i < vertices.length; i++) {
                requested_vertices.push([
                    vertices[i][0] + moveX,
                    vertices[i][1] + moveY,
                ]);
            }

            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: requested_vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move double copied individual vertex doesn't move");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 180 degrees around centroid
            // and doubling length
            // but no effect
            let requested_vertex_2 = [
                -2 * (vertices[2][0] - centroid[0]) + centroid[0],
                -2 * (vertices[2][1] - centroid[1]) + centroid[1],
            ];

            await win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: { 2: requested_vertex_2 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving single copied vertex doesn't move");
        cy.window().then(async (win) => {
            let centroid = vertices.reduce(
                (a, c) => [a[0] + c[0], a[1] + c[1]],
                [0, 0],
            );
            centroid[0] /= 4;
            centroid[1] /= 4;

            // rotate by 90 degrees clockwise around centroid
            // and shrinking by 1/4
            // but no effect
            let requested_vertex_3 = [
                0.25 * (vertices[3][1] - centroid[1]) + centroid[0],
                -0.25 * (vertices[3][0] - centroid[0]) + centroid[1],
            ];

            await win.callAction1({
                actionName: "movePoint",
                componentName: "/g2/v4",
                args: { x: requested_vertex_3[0], y: requested_vertex_3[1] },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving defining vertex deforms polygon");
        cy.window().then(async (win) => {
            vertices[0] = [4, 6];

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/_point1",
                args: { x: vertices[0][0], y: vertices[0][1] },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Rotate around vertex", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,7)</point>
    <point>(-4,-1)</point>
    <point>(8,2)</point>
    <point>(-3,4)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" preserveSimilarity rotateAround="vertex" rotationVertex="2" />
  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
    $pg.vertices{assignNames="v1 v2 v3 v4"}
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 7],
            [-4, -1],
            [8, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex rotates and dilates");
        cy.window().then(async (win) => {
            let rotationPoint = vertices[1];

            // rotate by 90 degrees counterclockwise around rotationPoint
            // and shrinking by 1/2
            let requested_vertex_0 = [
                -0.5 * (vertices[0][1] - rotationPoint[1]) + rotationPoint[0],
                0.5 * (vertices[0][0] - rotationPoint[0]) + rotationPoint[1],
            ];
            vertices = vertices.map((v) => [
                -0.5 * (v[1] - rotationPoint[1]) + rotationPoint[0],
                0.5 * (v[0] - rotationPoint[0]) + rotationPoint[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 0: requested_vertex_0 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right chooses minimum moved");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            // add extra movement to requested vertices, which will be ignored
            let requested_vertices = [];
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
                requested_vertices.push([
                    vertices[i][0] + i,
                    vertices[i][1] + 2 * i,
                ]);
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: requested_vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log(
            "move double copied individual vertex, getting rotation and dilation",
        );
        cy.window().then(async (win) => {
            let rotationPoint = vertices[1];

            // rotate by 180 degrees around rotationPoint
            // and doubling length
            let requested_vertex_2 = [
                -2 * (vertices[2][0] - rotationPoint[0]) + rotationPoint[0],
                -2 * (vertices[2][1] - rotationPoint[1]) + rotationPoint[1],
            ];
            vertices = vertices.map((v) => [
                -2 * (v[0] - rotationPoint[0]) + rotationPoint[0],
                -2 * (v[1] - rotationPoint[1]) + rotationPoint[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: { 2: requested_vertex_2 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving single copied vertex gets rotation and dilation");
        cy.window().then(async (win) => {
            let rotationPoint = vertices[1];

            // rotate by 90 degrees clockwise around rotationPoint
            // and shrinking by 1/4
            let requested_vertex_3 = [
                0.25 * (vertices[3][1] - rotationPoint[1]) + rotationPoint[0],
                -0.25 * (vertices[3][0] - rotationPoint[0]) + rotationPoint[1],
            ];
            vertices = vertices.map((v) => [
                0.25 * (v[1] - rotationPoint[1]) + rotationPoint[0],
                -0.25 * (v[0] - rotationPoint[0]) + rotationPoint[1],
            ]);

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g2/v4",
                args: { x: requested_vertex_3[0], y: requested_vertex_3[1] },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving defining vertex deforms polygon");
        cy.window().then(async (win) => {
            vertices[0] = [4, 6];

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/_point1",
                args: { x: vertices[0][0], y: vertices[0][1] },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });

    it("Rotate around exterior point", () => {
        cy.window().then(async (win) => {
            win.postMessage(
                {
                    doenetML: `
  <text>a</text>
  <graph name="g1" newNamespace>
    <point>(3,7)</point>
    <point>(-4,-1)</point>
    <point>(8,2)</point>
    <point>(-3,4)</point>
    <point name="rotationPoint" styleNumber="2">(-1,3)</point>
    <polygon vertices="$_point1 $_point2 $_point3 $_point4" name="pg" preserveSimilarity rotateAround="point" rotationCenter="$rotationPoint" />

  </graph>
  <graph name="g2" newNamespace>
    $(../g1/pg{name="pg"})
    $pg.vertices{assignNames="v1 v2 v3 v4"}
  </graph>
  $g2{name="g3"}
  $(g1/pg.vertices{assignNames="p1 p2 p3 p4"})
  `,
                },
                "*",
            );
        });
        cy.get(cesc("#\\/_text1")).should("have.text", "a"); //wait for page to load

        let vertices = [
            [3, 7],
            [-4, -1],
            [8, 2],
            [-3, 4],
        ];

        testPolygonCopiedTwice({ vertices });

        cy.log("move individual vertex rotates and dilates");
        cy.window().then(async (win) => {
            let rotationPoint = [-1, 3];

            // rotate by 90 degrees counterclockwise around rotationPoint
            // and shrinking by 1/2
            let requested_vertex_0 = [
                -0.5 * (vertices[0][1] - rotationPoint[1]) + rotationPoint[0],
                0.5 * (vertices[0][0] - rotationPoint[0]) + rotationPoint[1],
            ];
            vertices = vertices.map((v) => [
                -0.5 * (v[1] - rotationPoint[1]) + rotationPoint[0],
                0.5 * (v[0] - rotationPoint[0]) + rotationPoint[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g1/pg",
                args: {
                    pointCoords: { 0: requested_vertex_0 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("move copied polygon up and to the right chooses minimum moved");
        cy.window().then(async (win) => {
            let moveX = 3;
            let moveY = 2;

            // add extra movement to requested vertices, which will be ignored
            let requested_vertices = [];
            for (let i = 0; i < vertices.length; i++) {
                vertices[i][0] = vertices[i][0] + moveX;
                vertices[i][1] = vertices[i][1] + moveY;
                requested_vertices.push([
                    vertices[i][0] + i,
                    vertices[i][1] + 2 * i,
                ]);
            }

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g2/pg",
                args: {
                    pointCoords: requested_vertices,
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log(
            "move double copied individual vertex, getting rotation and dilation",
        );
        cy.window().then(async (win) => {
            let rotationPoint = [-1, 3];

            // rotate by 180 degrees around rotationPoint
            // and doubling length
            let requested_vertex_2 = [
                -2 * (vertices[2][0] - rotationPoint[0]) + rotationPoint[0],
                -2 * (vertices[2][1] - rotationPoint[1]) + rotationPoint[1],
            ];
            vertices = vertices.map((v) => [
                -2 * (v[0] - rotationPoint[0]) + rotationPoint[0],
                -2 * (v[1] - rotationPoint[1]) + rotationPoint[1],
            ]);

            win.callAction1({
                actionName: "movePolygon",
                componentName: "/g3/pg",
                args: {
                    pointCoords: { 2: requested_vertex_2 },
                },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log(
            "change rotation point, then moving single copied vertex gets rotation and dilation",
        );
        cy.window().then(async (win) => {
            await win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/rotationPoint",
                args: { x: 6, y: -2 },
            });

            let rotationPoint = [6, -2];

            // rotate by 90 degrees clockwise around rotationPoint
            // and shrinking by 1/4
            let requested_vertex_3 = [
                0.25 * (vertices[3][1] - rotationPoint[1]) + rotationPoint[0],
                -0.25 * (vertices[3][0] - rotationPoint[0]) + rotationPoint[1],
            ];
            vertices = vertices.map((v) => [
                0.25 * (v[1] - rotationPoint[1]) + rotationPoint[0],
                -0.25 * (v[0] - rotationPoint[0]) + rotationPoint[1],
            ]);

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g2/v4",
                args: { x: requested_vertex_3[0], y: requested_vertex_3[1] },
            });

            testPolygonCopiedTwice({ vertices });
        });

        cy.log("moving defining vertex deforms polygon");
        cy.window().then(async (win) => {
            vertices[0] = [4, 6];

            win.callAction1({
                actionName: "movePoint",
                componentName: "/g1/_point1",
                args: { x: vertices[0][0], y: vertices[0][1] },
            });

            testPolygonCopiedTwice({ vertices });
        });
    });
});
